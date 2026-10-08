import { archiveStudioProject, getStudioProject, updateStudioProject } from "@/lib/portfolio-store";
import { requireStudioApiUser } from "@/lib/studio-auth";
import { deleteStudioMedia } from "@/lib/studio-media";
import { assertSameOrigin, StudioRequestError, studioErrorResponse } from "@/lib/studio-security";
import type { StudioProjectPayload } from "@/lib/studio-types";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireStudioApiUser();
    const { id } = await context.params;
    const project = await getStudioProject(id);
    if (!project) throw new StudioRequestError(404, "Project not found.");
    return Response.json({ project }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return studioErrorResponse(error);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const user = await requireStudioApiUser();
    const { id } = await context.params;
    const body = await request.json() as StudioProjectPayload;
    const result = await updateStudioProject(id, body, user);
    await deleteStudioMedia(result.removedStorageKeys);
    return Response.json({ project: result.project }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return studioErrorResponse(error);
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const user = await requireStudioApiUser();
    const { id } = await context.params;
    const body = await request.json().catch(() => ({})) as { version?: number };
    if (!Number.isInteger(body.version)) throw new StudioRequestError(400, "A project version is required.");
    const project = await archiveStudioProject(id, Number(body.version), user);
    return Response.json({ project }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return studioErrorResponse(error);
  }
}

import { createStudioProject, listStudioProjects } from "@/lib/portfolio-store";
import { assertSameOrigin, studioErrorResponse } from "@/lib/studio-security";
import { requireStudioApiUser } from "@/lib/studio-auth";
import type { StudioProjectPayload } from "@/lib/studio-types";

export async function GET() {
  try {
    await requireStudioApiUser();
    const projects = await listStudioProjects();
    return Response.json({ projects }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return studioErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireStudioApiUser();
    const body = await request.json() as StudioProjectPayload;
    const project = await createStudioProject(body, user);
    return Response.json({ project }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return studioErrorResponse(error);
  }
}

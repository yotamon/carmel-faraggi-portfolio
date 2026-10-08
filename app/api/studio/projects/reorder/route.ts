import { reorderStudioProjects } from "@/lib/portfolio-store";
import { requireStudioApiUser } from "@/lib/studio-auth";
import { assertSameOrigin, StudioRequestError, studioErrorResponse } from "@/lib/studio-security";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireStudioApiUser();
    const body = await request.json() as { group?: string; ids?: unknown };
    const group = body.group === "music-culture" ? "music-culture" : body.group === "commercial" ? "commercial" : null;
    if (!group || !Array.isArray(body.ids) || body.ids.some((id) => typeof id !== "string")) {
      throw new StudioRequestError(400, "Invalid project order.");
    }
    const projects = await reorderStudioProjects(group, body.ids as string[], user);
    return Response.json({ projects }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return studioErrorResponse(error);
  }
}

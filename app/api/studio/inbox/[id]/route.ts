import { requireStudioApiUser } from "@/lib/studio-auth";
import { setInquiryStatus, type InquiryStatus } from "@/lib/contact-inbox";
import { assertSameOrigin, studioErrorResponse } from "@/lib/studio-security";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const actor = await requireStudioApiUser();
    const { id } = await context.params;
    const payload = await request.json() as { status: InquiryStatus };
    await setInquiryStatus(Number(id), payload.status, actor);
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return studioErrorResponse(error);
  }
}

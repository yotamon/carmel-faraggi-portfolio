import { requireStudioApiUser } from "@/lib/studio-auth";
import { listInquiries } from "@/lib/contact-inbox";
import { studioErrorResponse } from "@/lib/studio-security";

export async function GET() {
  try {
    await requireStudioApiUser();
    return Response.json({ inquiries: await listInquiries() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return studioErrorResponse(error);
  }
}

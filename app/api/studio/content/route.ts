import { requireStudioApiUser } from "@/lib/studio-auth";
import { getSiteCopy, saveSiteCopy } from "@/lib/site-copy";
import { assertSameOrigin, studioErrorResponse } from "@/lib/studio-security";

export async function GET() {
  try {
    await requireStudioApiUser();
    return Response.json({copy:await getSiteCopy()},{headers:{"Cache-Control":"no-store"}});
  } catch(error) {return studioErrorResponse(error);}
}
export async function PATCH(request:Request) {
  try {
    assertSameOrigin(request);
    const user=await requireStudioApiUser();
    const content=await request.json();
    return Response.json({copy:await saveSiteCopy(content,user)},{headers:{"Cache-Control":"no-store"}});
  } catch(error) {return studioErrorResponse(error);}
}

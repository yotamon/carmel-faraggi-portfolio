import { requireStudioApiUser } from "@/lib/studio-auth";
import { getSocialLinks,saveSocialLinks } from "@/lib/site-links";
import { assertSameOrigin,studioErrorResponse } from "@/lib/studio-security";

export async function GET() {
  try {await requireStudioApiUser();return Response.json({links:await getSocialLinks()},{headers:{"Cache-Control":"no-store"}});}
  catch(error){return studioErrorResponse(error);}
}
export async function PATCH(request:Request) {
  try {
    assertSameOrigin(request);
    const user=await requireStudioApiUser();
    return Response.json({links:await saveSocialLinks(await request.json(),user)},{headers:{"Cache-Control":"no-store"}});
  }catch(error){return studioErrorResponse(error);}
}

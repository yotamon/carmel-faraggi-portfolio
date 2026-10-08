import { requireStudioApiUser } from "@/lib/studio-auth";
import { deleteStudioCover } from "@/lib/studio-covers";
import { deleteStudioMedia } from "@/lib/studio-media";
import { assertSameOrigin,studioErrorResponse } from "@/lib/studio-security";

export async function DELETE(request:Request,context:{params:Promise<{id:string}>}){
  try {
    assertSameOrigin(request); const actor=await requireStudioApiUser();
    const {id}=await context.params;
    const key=await deleteStudioCover(id,actor);
    await deleteStudioMedia([key]);
    return Response.json({ok:true},{headers:{"Cache-Control":"no-store"}});
  }catch(error){return studioErrorResponse(error);}
}

import { requireStudioApiUser } from "@/lib/studio-auth";
import { listEditableCovers,addStudioCover,updateStudioCovers } from "@/lib/studio-covers";
import { assertSameOrigin,studioErrorResponse } from "@/lib/studio-security";

export async function GET(){
  try {await requireStudioApiUser();return Response.json({covers:await listEditableCovers()},{headers:{"Cache-Control":"no-store"}});}
  catch(error){return studioErrorResponse(error);}
}
export async function POST(request:Request){
  try {assertSameOrigin(request);const actor=await requireStudioApiUser();return Response.json({covers:await addStudioCover(await request.json(),actor)},{headers:{"Cache-Control":"no-store"},status:201});}
  catch(error){return studioErrorResponse(error);}
}
export async function PUT(request:Request){
  try {assertSameOrigin(request);const actor=await requireStudioApiUser();return Response.json({covers:await updateStudioCovers(await request.json(),actor)},{headers:{"Cache-Control":"no-store"}});}
  catch(error){return studioErrorResponse(error);}
}

// Convert and resize images before uploading to a Sites R2-backed studio.
// This avoids requiring a Cloudflare Images transform binding on the server.
export async function prepareStudioImage(file:File):Promise<{file:File;width:number;height:number}> {
  const MAX_DIMENSION=2400;
  let bitmap:ImageBitmap|null=null;
  let fallbackImage:HTMLImageElement|null=null;
  let objectUrl:string|null=null;
  try{
    let sourceWidth:number;
    let sourceHeight:number;
    if(typeof createImageBitmap==="function") {
      bitmap=await createImageBitmap(file);
      sourceWidth=bitmap.width;
      sourceHeight=bitmap.height;
    } else {
      objectUrl=URL.createObjectURL(file);
      fallbackImage=new Image();
      await new Promise<void>((resolve,reject)=>{
        fallbackImage!.onload=()=>resolve();
        fallbackImage!.onerror=()=>reject(new Error("Could not read the selected image."));
        fallbackImage!.src=objectUrl!;
      });
      sourceWidth=fallbackImage.naturalWidth;
      sourceHeight=fallbackImage.naturalHeight;
    }
    if(!sourceWidth||!sourceHeight)throw new Error("The image has invalid dimensions.");
    const ratio=Math.min(1,MAX_DIMENSION/sourceWidth,MAX_DIMENSION/sourceHeight);
    const width=Math.max(1,Math.round(sourceWidth*ratio));
    const height=Math.max(1,Math.round(sourceHeight*ratio));
    const canvas=document.createElement("canvas");
    canvas.width=width;canvas.height=height;
    const context=canvas.getContext("2d",{alpha:false});
    if(!context)throw new Error("Image conversion isn't supported by this browser.");
    context.drawImage(bitmap??fallbackImage!,0,0,width,height);
    const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(result=>result?resolve(result):reject(new Error("Could not create a WebP image.")),"image/webp",.84));
    if(blob.type!=="image/webp")throw new Error("WebP export is not supported by this browser. Please upload a WebP file.");
    if(blob.size>10*1024*1024)throw new Error("The optimized image is too large. Please use a smaller file.");
    return {file:new File([blob],file.name.replace(/\.[^.]+$/,"")+".webp",{type:"image/webp"}),width,height};
  }finally {
    bitmap?.close();
    if(objectUrl)URL.revokeObjectURL(objectUrl);
  }
}

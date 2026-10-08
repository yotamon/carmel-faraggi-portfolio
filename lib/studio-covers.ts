import { selectedCovers, type CoverArtwork } from "@/lib/artists";
import { ensureStudioSchema } from "@/lib/studio-db";
import { getDatabase } from "@/lib/studio-runtime";
import { isStudioStorageKey, StudioRequestError } from "@/lib/studio-security";
import type { ChatGPTUser } from "@/app/chatgpt-auth";

export type EditableCover = CoverArtwork & {id:string; storageKey:string|null; visible:boolean; sortOrder:number};
type CoverRow={id:string;src:string;alt:string;width:number;storage_key:string|null;visible:number;sort_order:number};
let seedPromise:Promise<void>|null=null;

async function ready() {
  await ensureStudioSchema();
  if(!seedPromise) {
    seedPromise=(async()=>{
      const db=await getDatabase();
      await db.batch(selectedCovers.map((cover,i)=>db.prepare(
        "INSERT OR IGNORE INTO studio_covers (id,src,alt,width,storage_key,sort_order,visible) VALUES (?,?,?,?,NULL,?,1)",
      ).bind("preset-"+String(i+1).padStart(2,"0"),cover.src,cover.alt,cover.width,(i+1)*10)));
    })().catch(err=>{seedPromise=null;throw err;});
  }
  await seedPromise;
}

export async function listEditableCovers():Promise<EditableCover[]> {
  await ready();
  const db=await getDatabase();
  const rows=await db.prepare("SELECT id,src,alt,width,storage_key,visible,sort_order FROM studio_covers ORDER BY sort_order,id").all<CoverRow>();
  return (rows.results??[]).map(row=>({
    id:row.id,src:row.src,alt:row.alt,width:row.width,storageKey:row.storage_key,
    visible:row.visible===1,sortOrder:row.sort_order,
  }));
}

export async function listPublishedCovers():Promise<CoverArtwork[]> {
  try {
    const covers=await listEditableCovers();
    return covers.filter(cover=>cover.visible).map(({src,alt,width})=>({src,alt,width}));
  }catch(error) {
    if (!(error instanceof Error && error.message.includes("cloudflare:"))) console.error("Covers unavailable; using bundled artwork.",error);
    return selectedCovers;
  }
}

export async function addStudioCover(input:unknown,actor:ChatGPTUser):Promise<EditableCover[]> {
  const data=input as {src?:unknown;storageKey?:unknown;alt?:unknown;width?:unknown};
  if(!data || typeof data!=="object")throw new StudioRequestError(400,"Invalid artwork.");
  const key=String(data.storageKey??"");
  const src=String(data.src??"");
  const alt=String(data.alt??"").trim();
  const width=Number(data.width);
  if(!isStudioStorageKey(key)||src!=="/media/"+key)throw new StudioRequestError(400,"Upload artwork through the Studio uploader.");
  if(!alt||alt.length>300)throw new StudioRequestError(400,"Add a clear description under 300 characters.");
  if(!Number.isInteger(width)||width<1||width>2400)throw new StudioRequestError(400,"Invalid image size.");
  const current=await listEditableCovers();
  if(current.length>=80)throw new StudioRequestError(409,"The cover library is full.");
  const db=await getDatabase();
  const media=await db.prepare("SELECT attached_project_id, width FROM portfolio_media WHERE storage_key=?").bind(key).first<{attached_project_id:string|null;width:number}>();
  if(!media||media.attached_project_id)throw new StudioRequestError(409,"This artwork is not available to attach.");
  if(media.width!==width)throw new StudioRequestError(400,"The uploaded image dimensions do not match.");
  const id=crypto.randomUUID();
  const order=current.reduce((max,cover)=>Math.max(max,cover.sortOrder),0)+10;
  await db.batch([
    db.prepare("INSERT INTO studio_covers (id,src,alt,width,storage_key,sort_order,visible) VALUES (?,?,?,?,?,?,1)").bind(id,src,alt,width,key,order),
    db.prepare("UPDATE portfolio_media SET attached_project_id=?,updated_at=CURRENT_TIMESTAMP WHERE storage_key=? AND attached_project_id IS NULL").bind("cover:"+id,key),
    db.prepare("INSERT INTO studio_audit_log (actor_email,actor_user_id,action,entity_type,entity_id,details_json) VALUES (?,?,'cover_added','cover',?,?)").bind(actor.email.toLowerCase(),actor.userId,id,JSON.stringify({src})),
  ]);
  return listEditableCovers();
}

export async function updateStudioCovers(input:unknown,actor:ChatGPTUser):Promise<EditableCover[]> {
  if(!Array.isArray(input))throw new StudioRequestError(400,"Invalid cover order.");
  const current=await listEditableCovers();
  if(input.length!==current.length||input.length>80)throw new StudioRequestError(400,"Cover list changed. Reload before saving.");
  const known=new Set(current.map(cover=>cover.id));
  const seen=new Set<string>();
  const entries:{id:string;alt:string;visible:boolean}[]=[];
  for(const entry of input){
    if(!entry||typeof entry!=="object")throw new StudioRequestError(400,"Invalid cover.");
    const id=String(entry.id??"");
    const alt=String(entry.alt??"").trim();
    if(!known.has(id)||seen.has(id)||!alt||alt.length>300||typeof entry.visible!=="boolean")
      throw new StudioRequestError(400,"Check cover descriptions and reload if the library changed.");
    seen.add(id);
    entries.push({id,alt,visible:entry.visible});
  }
  const db=await getDatabase();
  await db.batch([
    ...entries.map((entry,index)=>db.prepare("UPDATE studio_covers SET alt=?,visible=?,sort_order=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(entry.alt,entry.visible?1:0,(index+1)*10,entry.id)),
    db.prepare("INSERT INTO studio_audit_log (actor_email,actor_user_id,action,entity_type,entity_id,details_json) VALUES (?,?,'covers_updated','cover',NULL,?)").bind(actor.email.toLowerCase(),actor.userId,JSON.stringify({count:entries.length})),
  ]);
  return listEditableCovers();
}

export async function deleteStudioCover(id:string,actor:ChatGPTUser) {
  const covers=await listEditableCovers();
  const cover=covers.find(item=>item.id===id);
  if(!cover)throw new StudioRequestError(404,"Artwork not found.");
  if(!cover.storageKey)throw new StudioRequestError(400,"Built-in artwork can be hidden but not deleted.");
  const db=await getDatabase();
  await db.batch([
    db.prepare("DELETE FROM studio_covers WHERE id=?").bind(id),
    db.prepare("UPDATE portfolio_media SET attached_project_id=NULL,updated_at=CURRENT_TIMESTAMP WHERE storage_key=? AND attached_project_id=?").bind(cover.storageKey,"cover:"+id),
    db.prepare("INSERT INTO studio_audit_log (actor_email,actor_user_id,action,entity_type,entity_id,details_json) VALUES (?,?,'cover_deleted','cover',?,?)").bind(actor.email.toLowerCase(),actor.userId,id,JSON.stringify({src:cover.src})),
  ]);
  return cover.storageKey;
}

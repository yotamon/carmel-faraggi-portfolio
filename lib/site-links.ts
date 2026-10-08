import { ensureStudioSchema } from "@/lib/studio-db";
import { getDatabase } from "@/lib/studio-runtime";
import { StudioRequestError } from "@/lib/studio-security";

export const socialNames = ["instagram","behance","linkedin"] as const;
export type SocialLinkKey = typeof socialNames[number];
export type SocialLinks = Record<SocialLinkKey,string>;
const empty: SocialLinks = {instagram:"",behance:"",linkedin:""};
const domains:Record<SocialLinkKey,string[]> = {
  instagram:["instagram.com","www.instagram.com"],
  behance:["behance.net","www.behance.net"],
  linkedin:["linkedin.com","www.linkedin.com"],
};
export async function getSocialLinks():Promise<SocialLinks> {
  const result={...empty};
  try {
    await ensureStudioSchema();
    const db=await getDatabase();
    const rows=await db.prepare("SELECT link_key,link_url FROM studio_social_links").all<{link_key:string;link_url:string}>();
    for(const row of rows.results??[])if(socialNames.includes(row.link_key as SocialLinkKey))result[row.link_key as SocialLinkKey]=row.link_url;
  } catch(error) {
    if(!(error instanceof Error && error.message.includes("cloudflare:")))console.error("Social links unavailable.",error);
  }
  return result;
}
export async function saveSocialLinks(input:unknown,actor:{email:string;userId:string}):Promise<SocialLinks> {
  if(!input||typeof input!=="object"||Array.isArray(input))throw new StudioRequestError(400,"Invalid social links.");
  const body=input as Record<string,unknown>;
  if(Object.keys(body).some(key=>!socialNames.includes(key as SocialLinkKey)))throw new StudioRequestError(400,"Unknown social network.");
  const links={...empty};
  for(const key of socialNames) {
    const value=body[key];
    if(typeof value!=="string"||value.length>350)throw new StudioRequestError(400,"Use a valid social link under 350 characters.");
    const trimmed=value.trim();
    if(trimmed) {
      let url:URL;
      try{url=new URL(trimmed);}catch{throw new StudioRequestError(400,"Enter a valid HTTPS URL for "+key+".");}
      if(url.protocol!=="https:"||!domains[key].includes(url.hostname.toLowerCase())||url.username||url.password)
        throw new StudioRequestError(400,"Use an official HTTPS "+key+" URL.");
      links[key]=url.toString();
    }
  }
  await ensureStudioSchema();
  const db=await getDatabase();
  await db.batch([
    ...socialNames.map(key=>db.prepare(
      "INSERT INTO studio_social_links(link_key,link_url,updated_at) VALUES (?,?,CURRENT_TIMESTAMP) ON CONFLICT(link_key) DO UPDATE SET link_url=excluded.link_url,updated_at=CURRENT_TIMESTAMP",
    ).bind(key,links[key])),
    db.prepare("INSERT INTO studio_audit_log(actor_email,actor_user_id,action,entity_type,entity_id,details_json) VALUES (?,?,'social_links_updated','site',NULL,?)")
      .bind(actor.email.toLowerCase(),actor.userId,JSON.stringify({keys:socialNames})),
  ]);
  return links;
}

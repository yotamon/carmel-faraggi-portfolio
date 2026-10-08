import { ensureStudioSchema } from "@/lib/studio-db";
import { getDatabase } from "@/lib/studio-runtime";
import { StudioRequestError } from "@/lib/studio-security";

export const siteCopyDefaults = {
  "home.intro": "Independent design studio",
  "home.services": "Brand identity /\nGraphic design /\nArt direction",
  "about.one": "I came to design through art, music and fashion, and I still approach it with an artist's eye. I tend to think about the whole picture: colour, composition, image, atmosphere and how everything sits together.",
  "about.two": "Art direction is a big part of how I work. Every project has its own character. I like finding that first, then building from it, with the people it needs to reach always in mind.",
  "about.three": "That might mean a full identity or just one thing that needs doing really well, from a campaign or record cover to a menu, poster or piece of social content.",
  "artists.one": "Cover art, identities and release visuals for artists who want the image to feel as considered as the music.",
  "artists.two": "I’m a musician too, so I know how personal getting that right can be.",
  "contact.heading": "Have a project in mind?\nTell me a little about it.",
} as const;

export type SiteCopyKey = keyof typeof siteCopyDefaults;
export type SiteCopy = Record<SiteCopyKey,string>;
const keys = Object.keys(siteCopyDefaults) as SiteCopyKey[];

export async function getSiteCopy(): Promise<SiteCopy> {
  const copy: SiteCopy = { ...siteCopyDefaults };
  try {
    await ensureStudioSchema();
    const db=await getDatabase();
    const rows=await db.prepare("SELECT content_key,content_value FROM studio_site_copy").all<{content_key:string;content_value:string}>();
    for (const row of rows.results ?? []) {
      if (Object.hasOwn(siteCopyDefaults,row.content_key) && row.content_value.trim()) {
        copy[row.content_key as SiteCopyKey] = row.content_value;
      }
    }
  } catch (error) {
    if (!(error instanceof Error && (error.message.includes("cloudflare:") || error.message.includes("database binding is unavailable")))) {
      console.error("Studio site copy unavailable, using approved defaults.",error);
    }
  }
  return copy;
}

export async function saveSiteCopy(input: unknown, actor: {email:string;userId:string}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new StudioRequestError(400,"Invalid site content.");
  const values=input as Record<string,unknown>;
  if (Object.keys(values).some(key=>!Object.hasOwn(siteCopyDefaults,key))) throw new StudioRequestError(400,"Unknown content field.");
  for(const key of keys) {
    const value=values[key];
    if(typeof value!=="string" || value.trim().length<2 || value.length>1500) throw new StudioRequestError(400,"Fill out each text field, up to 1,500 characters.");
  }
  await ensureStudioSchema();
  const db=await getDatabase();
  const statements=keys.map(key=>db.prepare(
    "INSERT INTO studio_site_copy (content_key,content_value,updated_at) VALUES (?,?,CURRENT_TIMESTAMP) ON CONFLICT(content_key) DO UPDATE SET content_value=excluded.content_value,updated_at=CURRENT_TIMESTAMP",
  ).bind(key,(values[key] as string).trim()));
  statements.push(db.prepare("INSERT INTO studio_audit_log (actor_email,actor_user_id,action,entity_type,entity_id,details_json) VALUES (?,?,'site_copy_updated','site',NULL,?)")
    .bind(actor.email.toLowerCase(),actor.userId,JSON.stringify({keys})));
  await db.batch(statements);
  return getSiteCopy();
}

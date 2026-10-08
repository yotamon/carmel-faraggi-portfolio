import { env } from "cloudflare:workers";

const allowedEvents=new Set([
  "page_view",
  "contact_page_view",
  "contact_form_start",
  "contact_form_submit_success",
  "contact_form_submit_error",
  "contact_email_click",
  "for_artists_page_view",
  "for_artists_hero_cta_click",
  "for_artists_bottom_cta_click",
  "for_artists_project_click",
  "selected_covers_interaction",
]);

export async function POST(request:Request) {
  try {
    const origin=request.headers.get("origin");
    if(!origin || new URL(origin).host!==new URL(request.url).host)return new Response(null,{status:403});
    if(Number(request.headers.get("content-length")||"0")>1024)return new Response(null,{status:413});
    const body=await request.json() as {event?:unknown;path?:unknown};
    const event=typeof body?.event==="string"?body.event:"";
    const path=typeof body?.path==="string"?body.path:"";
    if(!allowedEvents.has(event)||!/^\/[a-z0-9/-]{0,150}$/i.test(path))return new Response(null,{status:400});
    const day=new Date().toISOString().slice(0,10);
    const db=env.DB;
    await db.prepare("CREATE TABLE IF NOT EXISTS studio_event_counts (event_day TEXT NOT NULL, event_key TEXT NOT NULL, event_path TEXT NOT NULL, event_count INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(event_day,event_key,event_path))").run();
    await db.prepare("INSERT INTO studio_event_counts(event_day,event_key,event_path,event_count) VALUES (?,?,?,1) ON CONFLICT(event_day,event_key,event_path) DO UPDATE SET event_count=event_count+1").bind(day,event,path).run();
    return new Response(null,{status:204,headers:{"Cache-Control":"no-store"}});
  }catch {
    // Analytics must never interrupt the visitor's browsing experience.
    return new Response(null,{status:204,headers:{"Cache-Control":"no-store"}});
  }
}

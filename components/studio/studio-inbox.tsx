"use client";

import { useState } from "react";
import type { StudioInquiry, InquiryStatus } from "@/lib/contact-inbox";

const filters = ["all", "new", "replied", "archived"] as const;
export function StudioInbox({initialInquiries,signOutHref}: {initialInquiries:StudioInquiry[];signOutHref:string}) {
  const [items,setItems] = useState(initialInquiries);
  const [filter,setFilter] = useState<typeof filters[number]>("new");
  const [saving,setSaving] = useState<number|null>(null);
  const [error,setError] = useState("");
  const visible = items.filter(item => filter==="all" || item.status===filter);

  async function change(id:number,status:InquiryStatus) {
    setSaving(id); setError("");
    try {
      const res=await fetch("/api/studio/inbox/"+id,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({status})});
      const data=await res.json() as {error?:string};
      if(!res.ok)throw new Error(data.error || "Could not update inquiry.");
      setItems(current=>current.map(item=>item.id===id ? {...item,status} : item));
    } catch(err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {setSaving(null);}
  }

  return <main className="studio-app">
    <header className="studio-topbar">
      <a className="studio-brand" href="/studio"><span>CARMEL</span><strong>STUDIO</strong></a>
      <div className="studio-topbar-actions"><a href="/studio">PROJECTS</a><a href="/studio/content">SITE CONTENT</a><a href="/studio/covers">COVERS</a><a href="/studio/insights">INSIGHTS</a><a href={signOutHref}>SIGN OUT</a></div>
    </header>
    <div className="studio-inbox">
      <p className="studio-kicker">PRIVATE / CLIENT ENQUIRIES</p>
      <h1 className="display">INBOX</h1>
      <p className="studio-inbox-summary">Every successful website enquiry is saved here, even if optional email notifications are unavailable. Mark each one when you&apos;ve replied.</p>
      <div className="studio-inbox-tabs" role="group" aria-label="Filter inquiries">
        {filters.map(value=><button type="button" key={value} className={filter===value?"is-active":""} aria-pressed={filter===value} onClick={()=>setFilter(value)}>{value.toUpperCase()} ({value==="all"?items.length:items.filter(item=>item.status===value).length})</button>)}
      </div>
      <p className="studio-form-message is-error" role="status">{error}</p>
      <div className="studio-inbox-list">
        {visible.length===0?<p className="studio-empty-state">No inquiries in this view.</p>:visible.map(item=><article className="studio-inquiry" key={item.id}>
          <div className="studio-inquiry-head"><div><h2>{item.name}</h2><p className="studio-inquiry-meta">{item.interest || "General enquiry"} · {item.createdAt} UTC</p></div><span className={"studio-status studio-status-"+item.status}>{item.status.toUpperCase()}</span></div>
          <a className="studio-inquiry-email" href={"mailto:"+item.email}>{item.email}</a>
          <p className="studio-inquiry-message">{item.project}</p>
          <div className="studio-inquiry-actions">
            <a href={"mailto:"+item.email+"?subject="+encodeURIComponent("Re: Your design project")}>REPLY VIA EMAIL ↗</a>
            {item.status!=="replied"?<button type="button" disabled={saving===item.id} onClick={()=>void change(item.id,"replied")}>MARK REPLIED</button>:null}
            {item.status!=="new"?<button type="button" className="is-outline" disabled={saving===item.id} onClick={()=>void change(item.id,"new")}>MARK NEW</button>:null}
            {item.status!=="archived"?<button type="button" className="is-outline" disabled={saving===item.id} onClick={()=>void change(item.id,"archived")}>ARCHIVE</button>:null}
          </div>
        </article>)}
      </div>
    </div>
  </main>;
}

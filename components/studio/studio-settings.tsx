"use client";

import { useState } from "react";
import type { SocialLinks,SocialLinkKey } from "@/lib/site-links";

const labels:Record<SocialLinkKey,string>={instagram:"INSTAGRAM",behance:"BEHANCE",linkedin:"LINKEDIN"};
const keys=Object.keys(labels) as SocialLinkKey[];

export function StudioSettings({initialLinks}:{initialLinks:SocialLinks}) {
  const [links,setLinks]=useState(initialLinks);
  const [saved,setSaved]=useState(initialLinks);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const dirty=keys.some(key=>links[key]!==saved[key]);
  async function save(){
    if(!dirty||busy)return;
    setBusy(true);setMessage("");
    try{
      const res=await fetch("/api/studio/settings",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify(links)});
      const data=await res.json() as {links?:SocialLinks;error?:string};
      if(!res.ok||!data.links)throw new Error(data.error||"Could not save settings.");
      setSaved(data.links);setLinks(data.links);setMessage("Settings saved. Visible links are updated on the public site.");
    }catch(error){setMessage(error instanceof Error?error.message:"Something went wrong.");}
    finally{setBusy(false);}
  }
  return <main className="studio-app">
    <header className="studio-topbar">
      <a className="studio-brand" href="/studio"><span>CARMEL</span><strong>STUDIO</strong></a>
      <div className="studio-topbar-actions"><a href="/studio">PROJECTS</a><a href="/studio/content">CONTENT</a><a href="/studio/covers">COVERS</a><a href="/studio/inbox">INBOX</a><a href="/studio/insights">INSIGHTS</a></div>
    </header>
    <section className="studio-settings-page">
      <p className="studio-kicker">PRIVATE / PUBLIC LINKS</p>
      <h1 className="display">SETTINGS.</h1>
      <p>Only add your real profiles. Empty links stay hidden on the public site. These links appear on About and Contact, without changing the layout.</p>
      <div className="studio-settings-form">
        {keys.map(key=><label key={key}><span>{labels[key]}</span><input type="url" inputMode="url" maxLength={350} placeholder={"https://"+(key==="behance"?"www.behance.net":key==="instagram"?"www.instagram.com":"www.linkedin.com")+"/..."} value={links[key]} onChange={event=>setLinks(current=>({...current,[key]:event.target.value}))}/></label>)}
        <button type="button" className="studio-primary-button" disabled={!dirty||busy} onClick={()=>void save()}>{busy?"SAVING…":"SAVE LINKS →"}</button>
        <p className="studio-form-message" role="status">{message||(!dirty?"ALL CHANGES SAVED":"UNSAVED CHANGES")}</p>
      </div>
    </section>
  </main>;
}

"use client";

import { useState } from "react";
import { type SiteCopy, type SiteCopyKey } from "@/lib/site-copy";

const groups:{title:string;description:string;url:string;fields:{key:SiteCopyKey;label:string;hint:string}[]}[]=[
  {title:"HOME",description:"The introduction beside the large Carmel Faraggi wordmark.",url:"/",fields:[
    {key:"home.intro",label:"SHORT INTRO",hint:"Keep it brief to fit the expressive home composition."},
    {key:"home.services",label:"SERVICES",hint:"Use line breaks to separate the services."},
  ]},
  {title:"ABOUT",description:"Carmel's voice, in three short paragraphs.",url:"/about",fields:[
    {key:"about.one",label:"FIRST PARAGRAPH",hint:"A personal introduction to the studio."},
    {key:"about.two",label:"SECOND PARAGRAPH",hint:"How Carmel thinks and works."},
    {key:"about.three",label:"THIRD PARAGRAPH",hint:"What kind of work the studio takes on."},
  ]},
  {title:"FOR ARTISTS",description:"The two paragraphs beside the editorial headline.",url:"/for-artists",fields:[
    {key:"artists.one",label:"INTRODUCTION",hint:"Explain the visual offer to musicians."},
    {key:"artists.two",label:"PERSONAL NOTE",hint:"Why the studio understands artists."},
  ]},
  {title:"CONTACT",description:"The opening line above the enquiry form.",url:"/contact",fields:[
    {key:"contact.heading",label:"CONTACT HEADLINE",hint:"Line breaks are preserved."},
  ]},
];

export function StudioSiteContent({initialCopy,signOutHref}:{initialCopy:SiteCopy;signOutHref:string}) {
  const [copy,setCopy]=useState(initialCopy);
  const [saved,setSaved]=useState(initialCopy);
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState("");
  const dirty=(Object.keys(copy) as SiteCopyKey[]).some(key=>copy[key]!==saved[key]);
  async function save() {
    if(!dirty || saving)return;
    setSaving(true);setMessage("");
    try{
      const res=await fetch("/api/studio/content",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify(copy)});
      const data=await res.json() as {copy?:SiteCopy;error?:string};
      if(!res.ok || !data.copy)throw new Error(data.error||"Could not save content.");
      setCopy(data.copy);setSaved(data.copy);setMessage("Saved. The public pages now use this content.");
    }catch(err){setMessage(err instanceof Error?err.message:"Could not save.");}
    finally{setSaving(false);}
  }
  return <main className="studio-app">
    <header className="studio-topbar">
      <a href="/studio" className="studio-brand"><span>CARMEL</span><strong>STUDIO</strong></a>
      <div className="studio-topbar-actions"><a href="/studio">PROJECTS</a><a href="/studio/inbox">INBOX</a><a href="/studio/covers">COVERS</a><a href="/studio/insights">INSIGHTS</a><a href={signOutHref}>SIGN OUT</a></div>
    </header>
    <div className="studio-content-editor">
      <p className="studio-kicker">PRIVATE / TEXT CONTENT</p>
      <h1 className="display">YOUR WORDS.</h1>
      <p className="studio-content-editor-lead">Edit text without changing the portfolio&apos;s design. The approved defaults remain until you save your changes. Published text updates on the public site.</p>
      {groups.map(group=><section className="studio-content-group" key={group.title}>
        <h2>{group.title}</h2><p>{group.description} <a href={group.url} target="_blank" rel="noreferrer" className="studio-text-link">VIEW PAGE ↗</a></p>
        {group.fields.map(field=><label className="studio-field" key={field.key}>
          <span>{field.label}</span><textarea value={copy[field.key]} maxLength={1500} rows={field.key.startsWith("about.")?5:3} onChange={event=>setCopy(current=>({...current,[field.key]:event.target.value}))} />
          <small>{field.hint} · {copy[field.key].length}/1500</small>
        </label>)}
      </section>)}
      <div className="studio-content-actions">
        <button type="button" className="studio-primary-button" onClick={()=>void save()} disabled={!dirty||saving}>{saving?"SAVING…":"SAVE ALL CHANGES →"}</button>
        <span>{dirty?"UNSAVED CHANGES":"ALL CHANGES SAVED"}</span>
      </div>
      <p className="studio-form-message" role="status" aria-live="polite">{message}</p>
    </div>
  </main>;
}

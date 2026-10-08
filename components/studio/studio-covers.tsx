"use client";

import { prepareStudioImage } from "@/lib/client-image";

/* eslint-disable @next/next/no-img-element -- Studio media has already been optimized to WebP. */
import { useState } from "react";
import type { EditableCover } from "@/lib/studio-covers";

export function StudioCovers({initialCovers,signOutHref}:{initialCovers:EditableCover[];signOutHref:string}) {
  const [items,setItems]=useState(initialCovers);
  const [saved,setSaved]=useState(JSON.stringify(initialCovers));
  const [file,setFile]=useState<File|null>(null);
  const [newAlt,setNewAlt]=useState("");
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const dirty=JSON.stringify(items)!==saved;

  async function call(url:string,method:string,body?:object){
    const res=await fetch(url,{method,headers:{"content-type":"application/json"},body:body?JSON.stringify(body):undefined});
    const data=await res.json() as {error?:string;covers?:EditableCover[]};
    if(!res.ok)throw new Error(data.error||"Could not save artwork.");
    return data;
  }
  function setList(next:EditableCover[]) {setItems(next);setSaved(JSON.stringify(next));}
  async function save() {
    if(busy||!dirty)return;
    setBusy(true);setMessage("");
    try{const res=await call("/api/studio/covers","PUT",items.map(({id,alt,visible})=>({id,alt,visible})));setList(res.covers??items);setMessage("The gallery is saved and updated on the public site.");}
    catch(error){setMessage(error instanceof Error?error.message:"Could not save.");}
    finally{setBusy(false);}
  }
  function move(index:number,delta:number){
    const next=[...items];const dest=index+delta;if(dest<0||dest>=next.length)return;
    [next[index],next[dest]]=[next[dest],next[index]];setItems(next);
  }
  async function add(){
    if(!file||!newAlt.trim()||busy||dirty)return;
    setBusy(true);setMessage("");
    try{
      const prepared=await prepareStudioImage(file);
      const form=new FormData();form.append("file",prepared.file);form.append("width",String(prepared.width));form.append("height",String(prepared.height));
      const response=await fetch("/api/studio/media",{method:"POST",body:form});
      const json=await response.json() as {media?:{src:string;storageKey:string;width:number};error?:string};
      if(!response.ok||!json.media)throw new Error(json.error||"Upload failed.");
      const result=await call("/api/studio/covers","POST",{src:json.media.src,storageKey:json.media.storageKey,width:json.media.width,alt:newAlt.trim()});
      setList(result.covers??items);setFile(null);setNewAlt("");setMessage("Artwork added to Selected Covers.");
    }catch(error){setMessage(error instanceof Error?error.message:"Upload failed.");}
    finally{setBusy(false);}
  }
  async function remove(id:string){
    if(busy||dirty||!window.confirm("Permanently remove this uploaded artwork?"))return;
    setBusy(true);setMessage("");
    try{await call("/api/studio/covers/"+encodeURIComponent(id),"DELETE");const result=await call("/api/studio/covers","GET");setList(result.covers??[]);setMessage("Artwork removed.");}
    catch(error){setMessage(error instanceof Error?error.message:"Could not delete.");}
    finally{setBusy(false);}
  }
  return <main className="studio-app">
    <header className="studio-topbar">
      <a className="studio-brand" href="/studio"><span>CARMEL</span><strong>STUDIO</strong></a>
      <div className="studio-topbar-actions"><a href="/studio">PROJECTS</a><a href="/studio/content">SITE CONTENT</a><a href="/studio/inbox">INBOX</a><a href="/studio/insights">INSIGHTS</a><a href="/studio/settings">SETTINGS</a><a href={signOutHref}>SIGN OUT</a></div>
    </header>
    <section className="studio-cover-manager">
      <p className="studio-kicker">MUSIC + CULTURE / PORTFOLIO</p>
      <h1 className="display">SELECTED COVERS.</h1>
      <p className="studio-cover-intro">Arrange the order, hide artwork that shouldn&apos;t appear and upload new covers. Built-in covers are protected from deletion. Give each artwork a meaningful image description.</p>
      <div className="studio-cover-add">
        <label>NEW ARTWORK IMAGE<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy||dirty} onChange={event=>setFile(event.target.files?.[0]??null)}/></label>
        <label>IMAGE DESCRIPTION<input type="text" value={newAlt} maxLength={300} disabled={busy||dirty} onChange={event=>setNewAlt(event.target.value)} placeholder="Artist, release name and visual description"/></label>
        <button type="button" className="studio-primary-button" disabled={!file||!newAlt.trim()||busy||dirty} onClick={()=>void add()}>{busy?"WORKING…":"+ ADD COVER"}</button>
      </div>
      <div className="studio-cover-grid">
        {items.map((cover,index)=><article className={"studio-cover-card"+(cover.visible?"":" is-hidden")} key={cover.id}>
          <img src={cover.src} width={cover.width} height={cover.width} alt={cover.alt} loading="lazy"/>
          <label>IMAGE DESCRIPTION<input type="text" maxLength={300} value={cover.alt} onChange={event=>setItems(current=>current.map(item=>item.id===cover.id?{...item,alt:event.target.value}:item))} /></label>
          <label><span><input type="checkbox" checked={cover.visible} onChange={event=>setItems(current=>current.map(item=>item.id===cover.id?{...item,visible:event.target.checked}:item))}/> VISIBLE ON SITE</span></label>
          <div className="studio-cover-controls">
            <button type="button" aria-label={"Move cover "+(index+1)+" earlier"} disabled={busy||index===0} onClick={()=>move(index,-1)}>←</button>
            <span>{String(index+1).padStart(2,"0")}</span>
            <button type="button" aria-label={"Move cover "+(index+1)+" later"} disabled={busy||index===items.length-1} onClick={()=>move(index,1)}>→</button>
            {cover.storageKey?<button type="button" aria-label="Delete uploaded cover" disabled={busy||dirty} onClick={()=>void remove(cover.id)}>×</button>:null}
          </div>
        </article>)}
      </div>
      <div className="studio-cover-actions">
        <button type="button" className="studio-primary-button" disabled={busy||!dirty} onClick={()=>void save()}>{busy?"SAVING…":"SAVE GALLERY →"}</button>
        <span>{dirty?"UNSAVED CHANGES":"ALL CHANGES SAVED"}</span>
      </div>
      <p className="studio-form-message" role="status" aria-live="polite">{message}</p>
    </section>
  </main>;
}

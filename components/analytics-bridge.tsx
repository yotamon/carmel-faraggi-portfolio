"use client";

import { useEffect } from "react";

// This first-party analytics bridge stores daily aggregate counts only.
// It does not set cookies, identify visitors or record search parameters.
export function AnalyticsBridge() {
  useEffect(()=>{
    function record(event:string) {
      if(!/^[a-z][a-z0-9_]{2,64}$/.test(event))return;
      if(window.location.pathname.startsWith("/studio") || window.location.pathname.startsWith("/api"))return;
      const payload=JSON.stringify({event,path:window.location.pathname});
      void fetch("/api/analytics",{method:"POST",headers:{"content-type":"application/json"},body:payload,keepalive:true}).catch(()=>{});
    }
    const listener=(raw:Event)=>{
      const detail=(raw as CustomEvent<{event?:unknown}>).detail;
      if(detail && typeof detail.event==="string")record(detail.event);
    };
    window.addEventListener("carmel:analytics",listener);
    record("page_view");
    return ()=>window.removeEventListener("carmel:analytics",listener);
  },[]);
  return null;
}

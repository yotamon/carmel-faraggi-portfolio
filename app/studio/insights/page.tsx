import type { Metadata } from "next";
import { requireStudioPage } from "@/lib/studio-auth";
import { listStudioInsights } from "@/lib/studio-insights";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Insights — Carmel Studio",robots:{index:false,follow:false}};
export default async function InsightsPage() {
  await requireStudioPage("/studio/insights");
  const stats=await listStudioInsights();
  const total=(event:string)=>stats.filter(row=>row.event===event).reduce((n,row)=>n+row.count,0);
  const summaries=[
    {label:"PAGE VIEWS",value:total("page_view")},
    {label:"ENQUIRY STARTS",value:total("contact_form_start")},
    {label:"SUCCESSFUL ENQUIRIES",value:total("contact_form_submit_success")},
    {label:"ARTIST PROJECT CLICKS",value:total("for_artists_project_click")},
  ];
  return <main className="studio-app">
    <header className="studio-topbar">
      <a className="studio-brand" href="/studio"><span>CARMEL</span><strong>STUDIO</strong></a>
      <div className="studio-topbar-actions"><a href="/studio">PROJECTS</a><a href="/studio/inbox">INBOX</a><a href="/studio/content">SITE CONTENT</a><a href="/studio/covers">COVERS</a></div>
    </header>
    <section className="studio-insights">
      <p className="studio-kicker">PRIVATE / LAST 30 DAYS</p>
      <h1 className="display">INSIGHTS.</h1>
      <p className="studio-insights-lead">A lightweight view of how the portfolio is used. Only daily event totals are recorded, without cookies or visitor identifiers. Counts are indicative, not unique visitors.</p>
      <div className="studio-insights-grid">
        {summaries.map(item=><article key={item.label}><strong>{item.value}</strong><span>{item.label}</span></article>)}
      </div>
      <h2>PAGE INTEREST</h2>
      <table className="studio-insights-table"><thead><tr><th>PAGE</th><th>VIEWS</th></tr></thead><tbody>
        {stats.filter(row=>row.event==="page_view").map(item=><tr key={item.path}><td>{item.path}</td><td>{item.count}</td></tr>)}
      </tbody></table>
      <p className="studio-insights-lead">Insights begin accumulating after the updated site is published. Client enquiries are managed separately in <a className="studio-text-link" href="/studio/inbox">the Studio inbox ↗</a>.</p>
    </section>
  </main>;
}

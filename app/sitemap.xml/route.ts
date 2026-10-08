import { listPublishedProjects } from "@/lib/portfolio-store";

export const dynamic = "force-dynamic";

function escapeXml(value:string) {
  return value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
export async function GET(request:Request) {
  const origin = new URL(request.url).origin;
  const staticPaths = ["/","/work","/for-artists","/about","/contact"];
  const projects = await listPublishedProjects();
  const paths = [...staticPaths, ...projects.map(project=>"/work/"+encodeURIComponent(project.slug))];
  const body = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    paths.map(path=>"  <url><loc>"+escapeXml(new URL(path,origin).toString())+"</loc></url>").join("\n")+
    "\n</urlset>";
  return new Response(body,{headers:{"Content-Type":"application/xml; charset=utf-8","Cache-Control":"public, max-age=300"}});
}

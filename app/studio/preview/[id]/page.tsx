import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { ProjectCaseStudy } from "@/components/project-case-study";
import { getStudioProject } from "@/lib/portfolio-store";
import { requireStudioPage } from "@/lib/studio-auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Project Preview — Carmel Studio", robots: { index: false, follow: false } };

export default async function StudioPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireStudioPage("/studio/preview/" + encodeURIComponent(id));
  const project = await getStudioProject(id);
  if (!project) notFound();
  return (
    <>
      <Navigation />
      <main id="main-content" className="project-page inner-page studio-preview-page" tabIndex={-1}>
        <ProjectCaseStudy project={project} preview editHref={"/studio/" + project.id} />
      </main>
    </>
  );
}

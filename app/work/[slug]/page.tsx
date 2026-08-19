import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { ProjectArtwork } from "@/components/project-artwork";
import { getNextProject, getProject, projects } from "@/lib/projects";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: `${project.title} — Carmel Faraggi Art & Design`,
    description: `${project.description} ${project.services.join(", ")}.`,
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const next = getNextProject(project.slug);

  return (
    <main className="project-page inner-page">
      <Navigation />
      <article className="case-study">
        <header className="case-study-header">
          <p className="eyebrow">{project.category}</p>
          <h1 className="display">{project.title}</h1>
          <div className="case-meta">
            <p>{project.year}</p>
            <p>{project.services.join(" / ")}</p>
          </div>
        </header>
        <ProjectArtwork project={project} hero />
        <section className="case-copy">
          <h2>THE PROJECT</h2>
          <p>{project.description}</p>
        </section>
        <div className="case-study-frame frame-detail" aria-hidden="true">
          <span>{project.title}</span>
        </div>
        <div className="case-study-frame frame-system">
          <p>IDENTITY</p><p>IMAGE</p><p>ATMOSPHERE</p>
        </div>
        <footer className="case-study-footer">
          <a href={`/work/${next.slug}`}>NEXT PROJECT <span aria-hidden="true">→</span><strong>{next.title}</strong></a>
          <a href="/contact">HAVE A PROJECT IN MIND? <span aria-hidden="true">→</span></a>
        </footer>
      </article>
    </main>
  );
}

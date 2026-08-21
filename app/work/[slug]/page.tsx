import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { ProjectArtwork } from "@/components/project-artwork";
import { getNextProject, getProject, projects, responsiveSrcSet } from "@/lib/projects";

/* eslint-disable @next/next/no-img-element -- vinext has no image optimizer; these images provide explicit responsive srcsets. */

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
    <>
      <Navigation />
      <main id="main-content" className="project-page inner-page" tabIndex={-1}>
        <article className="case-study">
        <header className="case-study-header" data-reveal>
          <p className="eyebrow">{project.category}</p>
          <h1 className="display">{project.title}</h1>
          <div className="case-meta">
            <p>{project.year}</p>
            <p>{project.services.join(" / ")}</p>
          </div>
        </header>
        <div data-reveal="fade">
          <ProjectArtwork project={project} hero priority />
        </div>
        <section className="case-copy" data-reveal>
          <h2>THE PROJECT</h2>
          <p>{project.description}</p>
        </section>
        <div className="case-study-gallery">
          {project.gallery.map((image, index) => (
            <img
              key={image.src}
              src={image.src}
              alt={image.alt}
              width={image.width ?? 1536}
              height={image.height ?? 1024}
              srcSet={responsiveSrcSet(image.src, image.width ?? 1536)}
              sizes="(max-width: 820px) calc(100vw - 36px), calc(100vw - 96px)"
              loading="lazy"
              decoding="async"
              data-reveal="fade"
              style={{ "--item": index } as React.CSSProperties}
            />
          ))}
        </div>
        <footer className="case-study-footer" data-reveal>
          <a href={`/work/${next.slug}`}>NEXT PROJECT <span aria-hidden="true">→</span><strong>{next.title}</strong></a>
          <a href="/contact">HAVE A PROJECT IN MIND? <span aria-hidden="true">→</span></a>
        </footer>
        </article>
      </main>
    </>
  );
}

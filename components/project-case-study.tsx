import type { Project } from "@/lib/projects";
import { responsiveSrcSet } from "@/lib/projects";
import { ProjectArtwork } from "@/components/project-artwork";

/* eslint-disable @next/next/no-img-element -- vinext has no image optimizer; these images provide explicit responsive srcsets. */

export function ProjectCaseStudy({
  project,
  next,
  preview = false,
  editHref,
}: {
  project: Project;
  next?: Project;
  preview?: boolean;
  editHref?: string;
}) {
  return (
    <article className="case-study">
      {preview ? (
        <div className="studio-preview-bar" role="status">
          <span><strong>PREVIEW</strong> This project is not being changed on the public site from this screen.</span>
          <span>
            {editHref ? <a href={editHref}>BACK TO EDITOR</a> : null}
            <a href="/studio">STUDIO</a>
          </span>
        </div>
      ) : null}
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
            key={image.src + "-" + index}
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
      {!preview && next ? (
        <footer className="case-study-footer" data-reveal>
          <a href={"/work/" + next.slug}>NEXT PROJECT <span aria-hidden="true">→</span><strong>{next.title}</strong></a>
          <a href={project.group === "music-culture" ? "/contact?type=music" : "/contact"}>HAVE A PROJECT IN MIND? <span aria-hidden="true">→</span></a>
        </footer>
      ) : null}
    </article>
  );
}

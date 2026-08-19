import Link from "next/link";
import type { Project } from "@/lib/projects";
import { ProjectArtwork } from "./project-artwork";

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <article className={`project-card layout-${project.layout}`} style={{ "--item": index } as React.CSSProperties}>
      <Link href={`/work/${project.slug}`} aria-label={`View ${project.title} project`}>
        <ProjectArtwork project={project} />
        <div className="project-card-info">
          <div>
            <p className="eyebrow">{project.category}</p>
            <h2 className="display project-title">{project.title}</h2>
          </div>
          <span className="arrow" aria-hidden="true">→</span>
        </div>
      </Link>
    </article>
  );
}

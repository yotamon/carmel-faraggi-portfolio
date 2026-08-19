import type { Project } from "@/lib/projects";

export function ProjectArtwork({ project, hero = false }: { project: Project; hero?: boolean }) {
  return (
    <div
      className={`project-artwork artwork-${project.slug} ${hero ? "is-hero" : ""}`}
      role="img"
      aria-label={`${project.title} — ${project.category.toLowerCase()} project preview`}
    >
      <div className={`artwork-image artwork-${project.slug} ${hero ? "is-hero" : ""}`} aria-hidden="true">
        {project.source === "type" ? (
          <span className="molt-art">
            <b>MOLT</b>
            <i>NEW SKIN</i>
          </span>
        ) : null}
      </div>
    </div>
  );
}

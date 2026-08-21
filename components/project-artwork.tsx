/* eslint-disable @next/next/no-img-element -- vinext has no image optimizer; these images provide explicit responsive srcsets. */
import { responsiveSrcSet, type Project } from "@/lib/projects";

export function ProjectArtwork({
  project,
  hero = false,
  priority = false,
}: {
  project: Project;
  hero?: boolean;
  priority?: boolean;
}) {
  return (
    <div className={`project-artwork artwork-${project.slug} ${hero ? "is-hero" : ""}`}>
      <img
        className="artwork-image"
        src={project.hero}
        alt={project.heroAlt}
        width={project.heroWidth}
        height={project.heroHeight}
        srcSet={responsiveSrcSet(project.hero, project.heroWidth)}
        sizes={hero ? "(max-width: 820px) calc(100vw - 36px), calc(100vw - 96px)" : "(max-width: 820px) calc(100vw - 46px), 68vw"}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
      />
    </div>
  );
}

import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { ProjectCard } from "@/components/project-card";
import { listPublishedProjects } from "@/lib/portfolio-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/work" },
  title: "Work — Carmel Faraggi Art & Design",
  description: "Selected brand identity, graphic design and art direction projects by Carmel Faraggi.",
};

export default async function WorkPage() {
  const workProjects = await listPublishedProjects("commercial");
  return (
    <>
      <Navigation />
      <main id="main-content" className="work-page inner-page" tabIndex={-1}>
        <section className="work-feed">
          <h1 className="display page-title work-heading" data-reveal="left">WORK</h1>
          <div className="projects-grid">
            {workProjects.map((project, index) => <ProjectCard project={project} index={index} key={project.slug} />)}
          </div>
          <div className="work-ending-links">
            <a className="work-contact-link work-artists-link" href="/for-artists" data-reveal><span>FOR ARTISTS</span><span aria-hidden="true">→</span></a>
            <a className="work-contact-link" href="/contact" data-reveal><span>CONTACT</span><span aria-hidden="true">→</span></a>
          </div>
        </section>
      </main>
    </>
  );
}

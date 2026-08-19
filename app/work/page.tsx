import type { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { ProjectCard } from "@/components/project-card";
import { projects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Work — Carmel Faraggi Art & Design",
  description: "Selected brand identity, graphic design, art direction and music projects by Carmel Faraggi.",
};

export default function WorkPage() {
  return (
    <main className="work-page inner-page">
      <Navigation />
      <section className="work-feed">
        <h1 className="display page-title work-heading">WORK</h1>
        <div className="projects-grid">
          {projects.map((project, index) => <ProjectCard project={project} index={index} key={project.slug} />)}
        </div>
        <Link className="work-contact-link" href="/contact"><span>CONTACT</span><span aria-hidden="true">→</span></Link>
      </section>
    </main>
  );
}

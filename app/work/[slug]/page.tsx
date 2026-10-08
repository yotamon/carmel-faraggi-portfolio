import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { ProjectCaseStudy } from "@/components/project-case-study";
import { getNextPublishedProject, getPublishedProject, getPublishedProjectRedirect } from "@/lib/portfolio-store";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublishedProject(slug);
  if (!project) return {};
  return {
    title: project.title + " — Carmel Faraggi Art & Design",
    description: project.description + " " + project.services.join(", ") + ".",
    openGraph: {
      title: project.title + " — Carmel Faraggi Art & Design",
      description: project.description,
      images: [project.hero],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title + " — Carmel Faraggi Art & Design",
      description: project.description,
      images: [project.hero],
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getPublishedProject(slug);
  if (!project) {
    const redirectSlug = await getPublishedProjectRedirect(slug);
    if (redirectSlug) redirect("/work/" + redirectSlug);
    notFound();
  }
  const next = await getNextPublishedProject(project.slug);

  return (
    <>
      <Navigation />
      <main id="main-content" className="project-page inner-page" tabIndex={-1}>
        <ProjectCaseStudy project={project} next={next} />
      </main>
    </>
  );
}

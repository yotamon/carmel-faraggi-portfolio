import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudioProjectEditor } from "@/components/studio/project-editor";
import { getStudioProject } from "@/lib/portfolio-store";
import { requireStudioPage } from "@/lib/studio-auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit Project — Carmel Studio", robots: { index: false, follow: false } };

export default async function StudioProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireStudioPage("/studio/" + encodeURIComponent(id));
  const project = await getStudioProject(id);
  if (!project) notFound();
  return <StudioProjectEditor initialProject={project} />;
}

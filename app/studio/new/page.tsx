import type { Metadata } from "next";
import { StudioProjectEditor } from "@/components/studio/project-editor";
import { requireStudioPage } from "@/lib/studio-auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "New Project — Carmel Studio", robots: { index: false, follow: false } };

export default async function NewStudioProjectPage() {
  await requireStudioPage("/studio/new");
  return <StudioProjectEditor initialProject={null} />;
}

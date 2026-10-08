import type { Metadata } from "next";
import { chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { requireStudioPage } from "@/lib/studio-auth";
import { listEditableCovers } from "@/lib/studio-covers";
import { StudioCovers } from "@/components/studio/studio-covers";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Selected Covers — Carmel Studio",robots:{index:false,follow:false}};
export default async function CoversPage(){
  await requireStudioPage("/studio/covers");
  return <StudioCovers initialCovers={await listEditableCovers()} signOutHref={chatGPTSignOutPath("/")} />;
}

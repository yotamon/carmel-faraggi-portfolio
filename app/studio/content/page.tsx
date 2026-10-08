import type { Metadata } from "next";
import { chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { requireStudioPage } from "@/lib/studio-auth";
import { getSiteCopy } from "@/lib/site-copy";
import { StudioSiteContent } from "@/components/studio/site-content-editor";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Site Content — Carmel Studio",robots:{index:false,follow:false}};

export default async function ContentPage() {
  await requireStudioPage("/studio/content");
  return <StudioSiteContent initialCopy={await getSiteCopy()} signOutHref={chatGPTSignOutPath("/")} />;
}

import type { Metadata } from "next";
import { chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { requireStudioPage } from "@/lib/studio-auth";
import { listInquiries } from "@/lib/contact-inbox";
import { StudioInbox } from "@/components/studio/studio-inbox";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Inquiries — Carmel Studio", robots: { index: false, follow: false } };

export default async function StudioInboxPage() {
  await requireStudioPage("/studio/inbox");
  return <StudioInbox initialInquiries={await listInquiries()} signOutHref={chatGPTSignOutPath("/")} />;
}

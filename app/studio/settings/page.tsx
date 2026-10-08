import type { Metadata } from "next";
import { requireStudioPage } from "@/lib/studio-auth";
import { getSocialLinks } from "@/lib/site-links";
import { StudioSettings } from "@/components/studio/studio-settings";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Site Settings — Carmel Studio",robots:{index:false,follow:false}};
export default async function SettingsPage(){
  await requireStudioPage("/studio/settings");
  return <StudioSettings initialLinks={await getSocialLinks()} />;
}

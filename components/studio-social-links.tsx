import type { SocialLinks } from "@/lib/site-links";

const socialLabels = {instagram:"INSTAGRAM",behance:"BEHANCE",linkedin:"LINKEDIN"} as const;

export function StudioSocialLinks({links}:{links:SocialLinks}) {
  const visible=(Object.keys(socialLabels) as (keyof SocialLinks)[]).filter(key=>Boolean(links[key]));
  if(!visible.length)return null;
  return <nav className="studio-social-links" aria-label="Carmel Faraggi social profiles">
    {visible.map(key=><a href={links[key]} target="_blank" rel="noopener noreferrer" key={key}>{socialLabels[key]} ↗</a>)}
  </nav>;
}

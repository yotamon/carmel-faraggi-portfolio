export type Project = {
  title: string;
  slug: string;
  category: string;
  group: "commercial" | "music-culture";
  year: string;
  services: string[];
  layout: "left" | "right" | "wide";
  hero: string;
  heroAlt: string;
  heroWidth: number;
  heroHeight: number;
  gallery: { src: string; alt: string; width?: number; height?: number }[];
  description: string;
};

export const projects: Project[] = [
  {
    title: "PROOF",
    slug: "proof",
    category: "FOOD + HOSPITALITY",
    group: "commercial",
    year: "2021",
    services: ["Brand identity", "Packaging", "Art direction"],
    layout: "left",
    hero: "/projects/proof/hero.png",
    heroAlt: "PROOF bakery brand identity applied to bread packaging and printed materials",
    heroWidth: 1536,
    heroHeight: 1024,
    gallery: [
      { src: "/projects/proof/brand-intro.png", alt: "PROOF brand identity introduction" },
      { src: "/projects/proof/bread-packaging.png", alt: "PROOF bread packaging system" },
      { src: "/projects/proof/coffee-cup.png", alt: "PROOF branded coffee cup" },
      { src: "/projects/proof/illustration.png", alt: "PROOF illustration system", width: 1254, height: 1254 },
      { src: "/projects/proof/menu-printed-touchpoints.png", alt: "PROOF menu and printed touchpoints" },
      { src: "/projects/proof/social-campaign.png", alt: "PROOF social campaign" },
    ],
    description:
      "A bold, direct identity for a London sourdough bakery, built to feel warm, confident and instantly recognisable across packaging and the everyday café experience.",
  },
  {
    title: "MOLT — NEW SKIN",
    slug: "molt-new-skin",
    category: "MUSIC + CULTURE",
    group: "music-culture",
    year: "2026",
    services: ["Art direction", "Release artwork", "Campaign"],
    layout: "right",
    hero: "/projects/molt-new-skin/hero.png",
    heroAlt: "MOLT New Skin album artwork",
    heroWidth: 1254,
    heroHeight: 1254,
    gallery: [
      { src: "/projects/molt-new-skin/vinyl-packaging.png", alt: "MOLT New Skin vinyl packaging" },
      { src: "/projects/molt-new-skin/poster-series.png", alt: "MOLT New Skin poster series" },
      { src: "/projects/molt-new-skin/merchandise.png", alt: "MOLT New Skin merchandise collection" },
      { src: "/projects/molt-new-skin/digital-campaign.png", alt: "MOLT New Skin digital campaign" },
    ],
    description:
      "Release artwork and campaign direction shaped around transformation, tension and a deliberately stripped-back graphic language.",
  },
  {
    title: "TAVLA",
    slug: "tavla",
    category: "FOOD + HOSPITALITY",
    group: "commercial",
    year: "2024",
    services: ["Brand identity", "Print", "Art direction"],
    layout: "right",
    hero: "/projects/tavla/hero.png",
    heroAlt: "TAVLA Mediterranean pop-up identity and dining scene",
    heroWidth: 1672,
    heroHeight: 941,
    gallery: [
      { src: "/projects/tavla/overview.png", alt: "TAVLA identity overview", width: 1672, height: 941 },
      { src: "/projects/tavla/brand.png", alt: "TAVLA brand system", width: 1709, height: 920 },
      { src: "/projects/tavla/visual-identity.png", alt: "TAVLA visual identity", width: 1672, height: 941 },
      { src: "/projects/tavla/poster.png", alt: "TAVLA poster design" },
      { src: "/projects/tavla/menu.png", alt: "TAVLA menu design" },
    ],
    description:
      "An expressive identity for a travelling Mediterranean pop-up, pairing a hand-made mark with tactile, richly lit applications.",
  },
  {
    title: "ANNA VALE",
    slug: "anna-vale",
    category: "BEAUTY + WELLNESS",
    group: "commercial",
    year: "2025",
    services: ["Brand identity", "Art direction", "Digital"],
    layout: "left",
    hero: "/projects/anna-vale/hero.png",
    heroAlt: "Anna Vale The Hour beauty identity campaign",
    heroWidth: 1448,
    heroHeight: 1086,
    gallery: [
      { src: "/projects/anna-vale/collateral.png", alt: "Anna Vale campaign and printed collateral" },
      { src: "/projects/anna-vale/campaign-graphic.png", alt: "Anna Vale The Hour campaign graphic" },
      { src: "/projects/anna-vale/stationery.png", alt: "Anna Vale stationery and treatment notes" },
      { src: "/projects/anna-vale/social-mobile.png", alt: "Anna Vale social and mobile campaign" },
      { src: "/projects/anna-vale/portrait.png", alt: "Anna Vale campaign portrait", width: 941, height: 1672 },
    ],
    description:
      "A restrained beauty identity balancing clinical precision with a soft, considered visual atmosphere.",
  },
  {
    title: "SOPHIA GREEN",
    slug: "sophia-green",
    category: "BEAUTY + WELLNESS",
    group: "commercial",
    year: "2025",
    services: ["Brand identity", "Print", "Social"],
    layout: "right",
    hero: "/projects/sophia-green/hero.png",
    heroAlt: "Sophia Green Pilates brand identity",
    heroWidth: 1536,
    heroHeight: 1024,
    gallery: [
      { src: "/projects/sophia-green/brand-system.png", alt: "Sophia Green brand identity system" },
      { src: "/projects/sophia-green/printed-collateral.png", alt: "Sophia Green printed collateral" },
      { src: "/projects/sophia-green/social-system.png", alt: "Sophia Green social media system", width: 1672, height: 941 },
    ],
    description:
      "A calm but characterful Pilates identity designed for private sessions and small groups in East London.",
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function getNextProject(slug: string) {
  const index = projects.findIndex((project) => project.slug === slug);
  return projects[(index + 1) % projects.length];
}

export function responsiveSrcSet(src: string, sourceWidth: number) {
  const variants = [480, 960]
    .filter((width) => width < sourceWidth)
    .map((width) => `${src.replace(/\.png$/, `-${width}.webp`)} ${width}w`);
  return [...variants, `${src} ${sourceWidth}w`].join(", ");
}

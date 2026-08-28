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
    hero: "/projects/proof/hero-full.webp",
    heroAlt: "PROOF bakery brand identity applied to bread packaging and printed materials",
    heroWidth: 1536,
    heroHeight: 1024,
    gallery: [
      { src: "/projects/proof/brand-intro-full.webp", alt: "PROOF brand identity introduction" },
      { src: "/projects/proof/bread-packaging-full.webp", alt: "PROOF bread packaging system" },
      { src: "/projects/proof/coffee-cup-full.webp", alt: "PROOF branded coffee cup" },
      { src: "/projects/proof/illustration-full.webp", alt: "PROOF illustration system", width: 1254, height: 1254 },
      { src: "/projects/proof/menu-printed-touchpoints-full.webp", alt: "PROOF menu and printed touchpoints" },
      { src: "/projects/proof/social-campaign-full.webp", alt: "PROOF social campaign" },
    ],
    description:
      "A bold, direct identity for a London sourdough bakery, built to feel warm, confident and instantly recognisable across packaging and the everyday café experience.",
  },
  {
    title: "ANNA VALE",
    slug: "anna-vale",
    category: "BEAUTY + WELLNESS",
    group: "commercial",
    year: "2025",
    services: ["Brand identity", "Art direction", "Digital"],
    layout: "right",
    hero: "/projects/anna-vale/hero-full.webp",
    heroAlt: "Anna Vale The Hour beauty identity campaign",
    heroWidth: 1448,
    heroHeight: 1086,
    gallery: [
      { src: "/projects/anna-vale/collateral-full.webp", alt: "Anna Vale campaign and printed collateral" },
      { src: "/projects/anna-vale/campaign-graphic-full.webp", alt: "Anna Vale The Hour campaign graphic" },
      { src: "/projects/anna-vale/stationery-full.webp", alt: "Anna Vale stationery and treatment notes" },
      { src: "/projects/anna-vale/social-mobile-full.webp", alt: "Anna Vale social and mobile campaign" },
      { src: "/projects/anna-vale/portrait-full.webp", alt: "Anna Vale campaign portrait", width: 941, height: 1672 },
    ],
    description:
      "A restrained beauty identity balancing clinical precision with a soft, considered visual atmosphere.",
  },
  {
    title: "TAVLA",
    slug: "tavla",
    category: "FOOD + HOSPITALITY",
    group: "commercial",
    year: "2024",
    services: ["Brand identity", "Print", "Art direction"],
    layout: "left",
    hero: "/projects/tavla/hero-full.webp",
    heroAlt: "TAVLA Mediterranean pop-up identity and dining scene",
    heroWidth: 1672,
    heroHeight: 941,
    gallery: [
      { src: "/projects/tavla/overview-full.webp", alt: "TAVLA identity overview", width: 1672, height: 941 },
      { src: "/projects/tavla/brand-full.webp", alt: "TAVLA brand system", width: 1709, height: 920 },
      { src: "/projects/tavla/visual-identity-full.webp", alt: "TAVLA visual identity", width: 1672, height: 941 },
      { src: "/projects/tavla/poster-full.webp", alt: "TAVLA poster design" },
      { src: "/projects/tavla/menu-full.webp", alt: "TAVLA menu design" },
    ],
    description:
      "An expressive identity for a travelling Mediterranean pop-up, pairing a hand-made mark with tactile, richly lit applications.",
  },
  {
    title: "SOPHIA GREEN",
    slug: "sophia-green",
    category: "BEAUTY + WELLNESS",
    group: "commercial",
    year: "2025",
    services: ["Brand identity", "Print", "Social"],
    layout: "right",
    hero: "/projects/sophia-green/hero-full.webp",
    heroAlt: "Sophia Green Pilates brand identity",
    heroWidth: 1536,
    heroHeight: 1024,
    gallery: [
      { src: "/projects/sophia-green/brand-system-full.webp", alt: "Sophia Green brand identity system" },
      { src: "/projects/sophia-green/printed-collateral-full.webp", alt: "Sophia Green printed collateral" },
      { src: "/projects/sophia-green/social-system-full.webp", alt: "Sophia Green social media system", width: 1672, height: 941 },
    ],
    description:
      "A calm but characterful Pilates identity designed for private sessions and small groups in East London.",
  },
  {
    title: "MOLT — NEW SKIN",
    slug: "molt-new-skin",
    category: "MUSIC + CULTURE",
    group: "music-culture",
    year: "2026",
    services: ["Art direction", "Release artwork", "Campaign"],
    layout: "left",
    hero: "/projects/molt-new-skin/hero-full.webp",
    heroAlt: "MOLT New Skin album artwork",
    heroWidth: 1254,
    heroHeight: 1254,
    gallery: [
      { src: "/projects/molt-new-skin/vinyl-packaging-full.webp", alt: "MOLT New Skin vinyl packaging" },
      { src: "/projects/molt-new-skin/poster-series-full.webp", alt: "MOLT New Skin poster series" },
      { src: "/projects/molt-new-skin/merchandise-full.webp", alt: "MOLT New Skin merchandise collection" },
      { src: "/projects/molt-new-skin/digital-campaign-full.webp", alt: "MOLT New Skin digital campaign" },
    ],
    description:
      "Release artwork and campaign direction shaped around transformation, tension and a deliberately stripped-back graphic language.",
  },
  {
    title: "VIVI",
    slug: "vivi",
    category: "MUSIC + CULTURE",
    group: "music-culture",
    year: "2026",
    services: ["Artist identity", "Release visuals", "Campaign"],
    layout: "right",
    hero: "/projects/vivi/hero-full.webp",
    heroAlt: "VIVI Girl Machine artist identity and debut release artwork",
    heroWidth: 1448,
    heroHeight: 1086,
    gallery: [
      { src: "/projects/vivi/poster-campaign-full.webp", alt: "VIVI Girl Machine poster campaign", width: 1448, height: 1086 },
      { src: "/projects/vivi/social-media-full.webp", alt: "VIVI Girl Machine social media campaign", width: 1448, height: 1086 },
      { src: "/projects/vivi/merchandise-full.webp", alt: "VIVI Girl Machine merchandise collection", width: 1448, height: 1086 },
    ],
    description:
      "Identity and release campaign for VIVI’s debut, GIRL MACHINE — a bold visual world spanning artwork, posters, social media and merchandise.",
  },
  {
    title: "ELI MOSS",
    slug: "eli-moss",
    category: "MUSIC + CULTURE",
    group: "music-culture",
    year: "2026",
    services: ["Artist identity", "Release artwork", "Print + social"],
    layout: "left",
    hero: "/projects/eli-moss/hero-full.webp",
    heroAlt: "Eli Moss A Room with the Window Open album identity",
    heroWidth: 1448,
    heroHeight: 1086,
    gallery: [
      { src: "/projects/eli-moss/identity-full.webp", alt: "Eli Moss album identity system", width: 1448, height: 1086 },
      { src: "/projects/eli-moss/poster-system-full.webp", alt: "Eli Moss poster system", width: 1448, height: 1086 },
      { src: "/projects/eli-moss/merchandise-vinyl-full.webp", alt: "Eli Moss vinyl packaging and merchandise", width: 1448, height: 1086 },
      { src: "/projects/eli-moss/digital-social-full.webp", alt: "Eli Moss digital and social campaign", width: 1448, height: 1086 },
      { src: "/projects/eli-moss/overview-full.webp", alt: "Eli Moss complete visual identity overview", width: 864, height: 1821 },
    ],
    description:
      "A brand identity and visual world for a contemporary folk album — intimate, quiet and timeless.",
  },
];

export const workProjects = projects.filter((project) => project.group === "commercial");
export const artistProjects = projects.filter((project) => project.group === "music-culture");

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function getNextProject(slug: string) {
  const current = getProject(slug);
  if (!current) return projects[0];
  const projectGroup = projects.filter((project) => project.group === current.group);
  const index = projectGroup.findIndex((project) => project.slug === slug);
  return projectGroup[(index + 1) % projectGroup.length];
}

export function responsiveSrcSet(src: string, sourceWidth: number) {
  const base = src.replace(/-full\.webp$/, "");
  const variants = [480, 960]
    .filter((width) => width < sourceWidth)
    .map((width) => `${base}-${width}.webp ${width}w`);
  return [...variants, `${src} ${sourceWidth}w`].join(", ");
}

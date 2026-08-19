export type Project = {
  title: string;
  slug: string;
  category: string;
  desktopCategory?: string;
  group: "commercial" | "music-culture";
  year: string;
  services: string[];
  layout: "left" | "right" | "wide";
  source: "work-a" | "work-b" | "mobile" | "type";
  description: string;
};

export const projects: Project[] = [
  {
    title: "PROOF",
    slug: "proof",
    category: "BAKERY / CAFÉ",
    desktopCategory: "FOOD + HOSPITALITY",
    group: "commercial",
    year: "2021",
    services: ["Brand identity", "Packaging", "Art direction"],
    layout: "left",
    source: "work-a",
    description:
      "A bold, direct identity for a London sourdough bakery, built to feel warm, confident and instantly recognisable across packaging and the everyday café experience.",
  },
  {
    title: "TAVLA",
    slug: "tavla",
    category: "HOSPITALITY / POP-UP",
    desktopCategory: "FOOD + HOSPITALITY",
    group: "commercial",
    year: "2024",
    services: ["Brand identity", "Print", "Art direction"],
    layout: "right",
    source: "work-a",
    description:
      "An expressive identity for a travelling Mediterranean pop-up, pairing a hand-made mark with tactile, richly lit applications.",
  },
  {
    title: "ANNA VALE",
    slug: "anna-vale",
    category: "BEAUTY / CLINIC",
    desktopCategory: "BEAUTY + WELLNESS",
    group: "commercial",
    year: "2025",
    services: ["Brand identity", "Art direction", "Digital"],
    layout: "left",
    source: "work-a",
    description:
      "A restrained beauty identity balancing clinical precision with a soft, considered visual atmosphere.",
  },
  {
    title: "SOPHIA GREEN",
    slug: "sophia-green",
    category: "WELLNESS / PILATES",
    desktopCategory: "WELLNESS",
    group: "commercial",
    year: "2025",
    services: ["Brand identity", "Print", "Social"],
    layout: "right",
    source: "work-b",
    description:
      "A calm but characterful Pilates identity designed for private sessions and small groups in East London.",
  },
  {
    title: "NORTH BOUND",
    slug: "north-bound",
    category: "ARTS + CULTURE",
    group: "music-culture",
    year: "2024",
    services: ["Editorial design", "Art direction"],
    layout: "left",
    source: "work-b",
    description:
      "A quiet, tactile editorial system that lets image, material and typography carry equal weight.",
  },
  {
    title: "STUDIO AURORA",
    slug: "studio-aurora",
    category: "BEAUTY + WELLNESS",
    group: "commercial",
    year: "2025",
    services: ["Brand identity", "Print"],
    layout: "right",
    source: "work-b",
    description:
      "A softly luxurious identity for a skin studio, grounded in light, tactility and understated detail.",
  },
  {
    title: "MAREA",
    slug: "marea",
    category: "FOOD + HOSPITALITY",
    group: "commercial",
    year: "2024",
    services: ["Brand identity", "Packaging", "Print"],
    layout: "left",
    source: "work-b",
    description:
      "A warm, crafted identity for an Italian kitchen, drawing on natural materials and a relaxed sense of occasion.",
  },
  {
    title: "MOLT — NEW SKIN",
    slug: "molt-new-skin",
    category: "MUSIC + CULTURE",
    group: "music-culture",
    year: "2026",
    services: ["Art direction", "Release artwork", "Campaign"],
    layout: "right",
    source: "type",
    description:
      "Release artwork and campaign direction shaped around transformation, tension and a deliberately stripped-back graphic language.",
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function getNextProject(slug: string) {
  const index = projects.findIndex((project) => project.slug === slug);
  return projects[(index + 1) % projects.length];
}

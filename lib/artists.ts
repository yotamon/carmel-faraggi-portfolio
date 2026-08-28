export type CoverArtwork = {
  src: string;
  alt: string;
  width: number;
};

export const selectedCovers: CoverArtwork[] = [
  { src: "/artists/selected-covers/cover-01-full.webp", alt: "Static Tide — Hollow Water cover artwork showing a flooded room", width: 640 },
  { src: "/artists/selected-covers/cover-02-full.webp", alt: "Late Fees — Every Light Left On cover artwork", width: 640 },
  { src: "/artists/selected-covers/cover-03-full.webp", alt: "Mira Sato — Frequency of Touch cover artwork", width: 640 },
  { src: "/artists/selected-covers/cover-04-full.webp", alt: "Harry — All Is Love cover artwork", width: 615 },
  { src: "/artists/selected-covers/cover-05-full.webp", alt: "Dance cover artwork with a vivid geometric corridor", width: 615 },
  { src: "/artists/selected-covers/cover-06-full.webp", alt: "Beth — Ego Maniac cover artwork", width: 615 },
  { src: "/artists/selected-covers/cover-07-full.webp", alt: "Charles — Blooming cover artwork", width: 615 },
  { src: "/artists/selected-covers/cover-08-full.webp", alt: "Cool Kids cover artwork with translucent trainers", width: 615 },
  { src: "/artists/selected-covers/cover-09-full.webp", alt: "Naya — Almost Here cover artwork", width: 640 },
  { src: "/artists/selected-covers/cover-10-full.webp", alt: "Too Sweet cover artwork at a Los Angeles motel", width: 640 },
  { src: "/artists/selected-covers/cover-11-full.webp", alt: "Micah Velvet — Lost in the Honey Light cover artwork", width: 640 },
  { src: "/artists/selected-covers/cover-12-full.webp", alt: "LUZE — Red Line cover artwork", width: 640 },
  { src: "/artists/selected-covers/cover-13-full.webp", alt: "KODEX — Pressure System cover artwork", width: 640 },
  { src: "/artists/selected-covers/cover-14-full.webp", alt: "Sugar Kiss — Five Different Voices cover artwork", width: 640 },
  { src: "/artists/selected-covers/cover-15-full.webp", alt: "Quatro Sin — Beloved and the Moon Knight cover artwork", width: 640 },
  { src: "/artists/selected-covers/cover-16-full.webp", alt: "North Arcade — False Weather cover artwork", width: 640 },
  { src: "/artists/selected-covers/cover-17-full.webp", alt: "LUMA — Soft Static cover artwork", width: 640 },
  { src: "/artists/selected-covers/cover-18-full.webp", alt: "Teen Age — New Album cover artwork", width: 615 },
  { src: "/artists/selected-covers/cover-19-full.webp", alt: "Can’t Cry — Retrospective cover artwork", width: 615 },
  { src: "/artists/selected-covers/cover-20-full.webp", alt: "Love cover artwork featuring a red rose", width: 350 },
  { src: "/artists/selected-covers/cover-21-full.webp", alt: "Monolo — Daylight Disco cover artwork", width: 298 },
];

export function coverSrcSet(cover: CoverArtwork) {
  const base = cover.src.replace(/-full\.webp$/, "");
  const variants = [240, 480]
    .filter((width) => width < cover.width)
    .map((width) => `${base}-${width}.webp ${width}w`);
  return [...variants, `${cover.src} ${cover.width}w`].join(", ");
}

import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";

export const metadata: Metadata = {
  title: "About — Carmel Faraggi Art & Design",
  description: "About Carmel Faraggi, an independent London graphic designer and art director.",
};

export default function AboutPage() {
  return (
    <main className="about-page inner-page">
      <Navigation />
      <div className="about-red-plane" aria-hidden="true" />
      <section className="about-content">
        <h1 className="display page-title" data-reveal="left">ABOUT</h1>
        <div className="about-copy">
          <p data-reveal style={{ "--item": 1 } as React.CSSProperties}>I came to design through art, music and fashion, and I still approach it with an artist&apos;s eye. I tend to think about the whole picture: colour, composition, image, atmosphere and how everything sits together.</p>
          <p data-reveal style={{ "--item": 2 } as React.CSSProperties}>Art direction is a big part of how I work. Every project has its own character. I like finding that first, then building from it, with the people it needs to reach always in mind.</p>
          <p data-reveal style={{ "--item": 3 } as React.CSSProperties}>That might mean a full identity or just one thing that needs doing really well, from a campaign or record cover to a menu, poster or piece of social content.</p>
          <p className="services" data-reveal style={{ "--item": 4 } as React.CSSProperties}><span>BRAND IDENTITY</span><b>/</b><span>GRAPHIC DESIGN</span><b>/</b><span>ART DIRECTION</span></p>
        </div>
      </section>
      <p className="location location-page">LONDON, UK</p>
    </main>
  );
}

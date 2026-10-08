import type { Metadata } from "next";
import { ArtistAnalytics } from "@/components/artist-analytics";
import { CoverRail } from "@/components/cover-rail";
import { Navigation } from "@/components/navigation";
import { listPublishedProjects } from "@/lib/portfolio-store";
import { responsiveSrcSet } from "@/lib/projects";

/* eslint-disable @next/next/no-img-element -- vinext has no image optimizer; responsive sources are provided explicitly. */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cover Art & Artist Branding — Carmel Faraggi Art & Design",
  description: "Cover art, artist identities and release visuals by Carmel Faraggi — graphic design and art direction for musicians and artists.",
  openGraph: {
    title: "Cover Art & Artist Branding — Carmel Faraggi Art & Design",
    description: "Cover art, artist identities and release visuals for musicians and artists.",
    images: ["/projects/molt-new-skin/hero-full.webp"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cover Art & Artist Branding — Carmel Faraggi Art & Design",
    description: "Cover art, artist identities and release visuals for musicians and artists.",
    images: ["/projects/molt-new-skin/hero-full.webp"],
  },
};

const services = ["ARTIST IDENTITY", "COVER ART", "RELEASE VISUALS", "SOCIAL CONTENT", "PRINT & MERCH"];

export default async function ForArtistsPage() {
  const artistProjects = await listPublishedProjects("music-culture");
  return (
    <>
      <Navigation />
      <main id="main-content" className="for-artists-page" tabIndex={-1}>
        <ArtistAnalytics />
        <section className="artists-hero" aria-labelledby="artists-title">
          <div className="artists-hero-red" aria-hidden="true" />
          <h1 id="artists-title" className="display artists-title">
            <span>VISUAL</span><span>WORLDS</span><span>FOR ARTISTS</span>
          </h1>
          <div className="artists-hero-copy">
            <p>Cover art, identities and release visuals for artists who want the image to feel as considered as the music.</p>
            <span className="artists-copy-rule" aria-hidden="true" />
            <p>I’m a musician too, so I know how personal getting that right can be.</p>
            <a href="/contact?type=music" data-artist-event="for_artists_hero_cta_click">
              <span>START A PROJECT</span><span aria-hidden="true">→</span>
            </a>
          </div>
        </section>

        <section className="artists-section featured-projects" aria-labelledby="featured-projects-title">
          <h2 id="featured-projects-title" className="artists-section-title">FEATURED PROJECTS</h2>
          <div className="featured-project-grid">
            {artistProjects.map((project) => (
              <a
                className={"featured-project featured-" + project.slug}
                href={"/work/" + project.slug}
                data-artist-event="for_artists_project_click"
                data-project-name={project.title}
                key={project.slug}
              >
                <span className="featured-project-image">
                  <img
                    src={project.hero}
                    srcSet={responsiveSrcSet(project.hero, project.heroWidth)}
                    sizes="(max-width: 767px) 40vw, (max-width: 1023px) 48vw, 32vw"
                    alt={project.heroAlt}
                    width={project.heroWidth}
                    height={project.heroHeight}
                    loading="eager"
                    decoding="async"
                  />
                </span>
                <span className="featured-project-meta">
                  <span>{project.title}</span><span aria-hidden="true">→</span>
                </span>
              </a>
            ))}
          </div>
        </section>

        <section className="artists-section selected-covers" aria-labelledby="selected-covers-title">
          <h2 id="selected-covers-title" className="artists-section-title">SELECTED COVERS</h2>
          <CoverRail />
        </section>

        <section className="artists-section artists-services" aria-labelledby="artists-services-title">
          <h2 id="artists-services-title" className="artists-section-title">WHAT I DO</h2>
          <ul>
            {services.map((service) => <li key={service}>{service}</li>)}
          </ul>
        </section>

        <section className="artists-closing" aria-labelledby="artists-closing-title">
          <p className="display artists-contact-word" aria-hidden="true">CONTACT</p>
          <div className="artists-closing-copy">
            <h2 id="artists-closing-title">HAVE A RELEASE IN MIND?</h2>
            <a href="/contact?type=music" data-artist-event="for_artists_bottom_cta_click">
              <span>TELL ME ABOUT IT</span><span aria-hidden="true">→</span>
            </a>
          </div>
        </section>
      </main>
    </>
  );
}

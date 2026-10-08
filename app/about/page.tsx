import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { getSiteCopy } from "@/lib/site-copy";
import { getSocialLinks } from "@/lib/site-links";
import { StudioSocialLinks } from "@/components/studio-social-links";

export const metadata: Metadata = {
  alternates: { canonical: "/about" },
  title: "About — Carmel Faraggi Art & Design",
  description: "About Carmel Faraggi, an independent London graphic designer and art director.",
};

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const [copy, socialLinks] = await Promise.all([getSiteCopy(),getSocialLinks()]);
  return (
    <>
      <Navigation />
      <main id="main-content" className="about-page inner-page" tabIndex={-1}>
        <div className="about-red-plane" aria-hidden="true" />
        <section className="about-content">
          <h1 className="display page-title">ABOUT</h1>
          <div className="about-copy">
            <div className="about-paragraphs about-paragraphs-desktop">
              <p>{copy["about.one"]}</p>
              <p>{copy["about.two"]}</p>
              <p>{copy["about.three"]}</p>
            </div>
            <div className="about-paragraphs about-paragraphs-mobile">
              <p>{copy["about.one"]}</p>
              <p>{copy["about.two"]}</p>
              <p>{copy["about.three"]}</p>
            </div>
            <p className="services"><span>BRAND IDENTITY</span><b aria-hidden="true">/</b><span>GRAPHIC DESIGN</span><b aria-hidden="true">/</b><span>ART DIRECTION</span></p>
            <a className="about-contact-link" href="/contact">HAVE SOMETHING IN MIND? <span aria-hidden="true">↗</span></a>
            <StudioSocialLinks links={socialLinks} />
          </div>
        </section>
        <p className="location location-page">LONDON, UK</p>
      </main>
    </>
  );
}

import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { ContactForm } from "@/components/contact-form";
import { TrackedEmailLink } from "@/components/tracked-email-link";
import { getSiteCopy } from "@/lib/site-copy";

export const metadata: Metadata = {
  title: "Contact — Carmel Faraggi Art & Design",
  description: "Start a brand identity, graphic design, art direction or music project with Carmel Faraggi.",
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const copy = await getSiteCopy();

  return (
    <>
      <Navigation />
      <main id="main-content" className="contact-page inner-page" tabIndex={-1}>
        <div className="contact-red-plane" aria-hidden="true" />
        <section className="contact-content">
          <div className="contact-intro">
            <h1 className="contact-editable-heading">{copy["contact.heading"]}</h1>
            <TrackedEmailLink />
          </div>
          <ContactForm initialInterest={type === "music" ? "Music / Artist Visuals" : ""} />
        </section>
        <p className="display contact-payoff" aria-hidden="true">CONTACT</p>
        <p className="location location-page contact-location">LONDON, UK</p>
      </main>
    </>
  );
}

import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact — Carmel Faraggi Art & Design",
  description: "Start a brand identity, graphic design, art direction or music project with Carmel Faraggi.",
};

export default function ContactPage() {
  return (
    <main className="contact-page inner-page">
      <Navigation />
      <div className="contact-red-plane" aria-hidden="true" />
      <section className="contact-content">
        <div className="contact-intro">
          <h1 data-reveal>Have a project in mind?<br />Tell me a little about it.</h1>
          <a href="mailto:carmelfaraggi@gmail.com" data-reveal style={{ "--item": 1 } as React.CSSProperties}>carmelfaraggi@gmail.com</a>
        </div>
        <ContactForm />
      </section>
      <p className="display contact-payoff" aria-hidden="true" data-reveal="fade">CONTACT</p>
      <p className="location location-page contact-location">LONDON, UK</p>
    </main>
  );
}

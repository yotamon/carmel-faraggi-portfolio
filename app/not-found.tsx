import { Navigation } from "@/components/navigation";

export default function NotFound() {
  return (
    <main className="not-found-page inner-page">
      <Navigation />
      <div className="not-found-red-plane" aria-hidden="true" />
      <section className="not-found-content">
        <p className="eyebrow" data-reveal>ERROR 404</p>
        <h1 className="display" data-reveal="left" style={{ "--item": 1 } as React.CSSProperties}>NOT<br />FOUND</h1>
        <a className="not-found-back" href="/" data-reveal style={{ "--item": 2 } as React.CSSProperties}>
          <span aria-hidden="true">←</span> BACK HOME
        </a>
      </section>
      <p className="location location-page">LONDON, UK</p>
    </main>
  );
}

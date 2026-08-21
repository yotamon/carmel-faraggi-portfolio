import { Navigation } from "@/components/navigation";

export default function NotFound() {
  return (
    <>
      <Navigation />
      <main id="main-content" className="not-found-page inner-page" tabIndex={-1}>
        <div className="not-found-red-plane" aria-hidden="true" />
        <section className="not-found-content">
          <p className="eyebrow">ERROR 404</p>
          <h1 className="display">NOT<br />FOUND</h1>
          <a className="not-found-back" href="/">
            <span aria-hidden="true">←</span> BACK HOME
          </a>
        </section>
        <p className="location location-page">LONDON, UK</p>
      </main>
    </>
  );
}

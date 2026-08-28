import { Navigation } from "@/components/navigation";

export default function Home() {
  return (
    <>
      <Navigation />
      <main id="main-content" className="home-page" tabIndex={-1}>
        <div className="home-artboard">
          <div className="home-red-plane" aria-hidden="true" />
          <h1 className="home-wordmark">
            <span className="visually-hidden">Carmel Faraggi</span>
            <picture className="home-name-art home-carmel">
              <source media="(max-width: 767px), (orientation: portrait)" srcSet="/wordmarks/carmel-mobile.png" />
              <img src="/wordmarks/carmel-desktop.png" alt="" width={1011} height={788} fetchPriority="high" draggable={false} aria-hidden="true" />
            </picture>
            <picture className="home-name-art home-faraggi">
              <source media="(max-width: 767px), (orientation: portrait)" srcSet="/wordmarks/faraggi.png" />
              <img src="/wordmarks/faraggi-desktop.png" alt="" width={999} height={443} fetchPriority="high" draggable={false} aria-hidden="true" />
            </picture>
          </h1>
        </div>
        <div className="home-intro">
          <p><strong>Independent<br className="mobile-only" /> design studio</strong></p>
          <p>Brand identity /<br /> Graphic design /<br />Art direction</p>
        </div>
        <a className="home-work-link" href="/work" aria-label="View Carmel Faraggi’s work">
          <span>VIEW WORK</span><span aria-hidden="true">→</span>
        </a>
        <p className="location location-home">LONDON, UK</p>
      </main>
    </>
  );
}

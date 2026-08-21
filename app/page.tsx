import { Navigation } from "@/components/navigation";

export default function Home() {
  return (
    <>
      <Navigation />
      <main id="main-content" className="home-page" tabIndex={-1}>
        <div className="home-artboard">
          <div className="home-red-plane" aria-hidden="true" />
          <h1 className="home-wordmark" aria-label="Carmel Faraggi">
            <span className="home-carmel">CARMEL</span>
            <span className="home-faraggi">FARAGGI</span>
            <span className="home-mobile-line home-mobile-carmel" aria-hidden="true">
              {"CARMEL".split("").map((letter, index) => <span key={`${letter}-${index}`}>{letter}</span>)}
            </span>
            <span className="home-mobile-line home-mobile-faraggi" aria-hidden="true">
              {"FARAGGI".split("").map((letter, index) => <span key={`${letter}-${index}`}>{letter}</span>)}
            </span>
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

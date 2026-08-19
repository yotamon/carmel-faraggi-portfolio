import Link from "next/link";
import { Navigation } from "@/components/navigation";

export default function Home() {
  return (
    <main className="home-page">
      <Navigation />
      <div className="home-artboard">
        <div className="home-red-plane" aria-hidden="true" />
        <h1 className="home-wordmark" aria-label="Carmel Faraggi">
          <span className="home-carmel">CARMEL</span>
          <span className="home-faraggi">FARAGGI</span>
        </h1>
      </div>
      <div className="home-intro">
        <p><strong>Independent<br className="mobile-only" /> design studio</strong></p>
        <p>Brand identity /<br /> Graphic design /<br />Art direction</p>
      </div>
      <Link className="home-work-link" href="/work" aria-label="View Carmel Faraggi’s work">
        <span>VIEW WORK</span><span aria-hidden="true">→</span>
      </Link>
      <p className="location location-home">LONDON, UK</p>
    </main>
  );
}

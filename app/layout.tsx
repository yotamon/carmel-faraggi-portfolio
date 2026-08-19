import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);
  return {
    metadataBase,
    title: "Carmel Faraggi — Graphic Designer & Art Director, London",
    description: "Independent London design studio for brand identity, graphic design and art direction.",
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    openGraph: {
      title: "Carmel Faraggi — Art & Design",
      description: "Brand identity, graphic design and art direction from an independent London studio.",
      images: [new URL("/og.png", metadataBase).toString()],
    },
    twitter: {
      card: "summary_large_image",
      title: "Carmel Faraggi — Art & Design",
      description: "Independent design studio. London, UK.",
      images: [new URL("/og.png", metadataBase).toString()],
    },
  };
}

const revealBootstrap = `(function () {
  var root = document.documentElement;
  if (!("IntersectionObserver" in window)) return;
  root.classList.add("js");
  var io = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting) {
        entries[i].target.classList.add("is-visible");
        io.unobserve(entries[i].target);
      }
    }
  }, { rootMargin: "0px 0px -6% 0px", threshold: 0.08 });
  var tracked = new WeakSet();
  var scan = function () {
    var nodes = document.querySelectorAll("[data-reveal]");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (tracked.has(el) || el.classList.contains("is-visible")) continue;
      tracked.add(el);
      io.observe(el);
    }
  };
  scan();
  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <script dangerouslySetInnerHTML={{ __html: revealBootstrap }} />
        {children}
      </body>
    </html>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/work", label: "WORK" },
  { href: "/about", label: "ABOUT" },
  { href: "/contact", label: "CONTACT" },
];

function isCurrent(pathname: string, href: string) {
  return href === "/work" ? pathname.startsWith("/work") : pathname === href;
}

export function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  return (
    <>
      <header className="site-header">
        <nav className="desktop-nav" aria-label="Primary navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={isCurrent(pathname, link.href) ? "is-active" : ""}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link className="location location-top" href="/" aria-label="Carmel Faraggi home">
          LONDON, UK
        </Link>
        <button
          className={`menu-toggle ${open ? "is-open" : ""}`}
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <div id="mobile-menu" className={`mobile-menu ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <nav aria-label="Mobile navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              tabIndex={open ? 0 : -1}
              className={isCurrent(pathname, link.href) ? "is-active" : ""}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="mobile-menu-location">LONDON, UK</p>
      </div>
    </>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const links = [
  { href: "/work", label: "WORK" },
  { href: "/for-artists", label: "FOR ARTISTS" },
  { href: "/about", label: "ABOUT" },
  { href: "/contact", label: "CONTACT" },
];

const mobileLinks = [{ href: "/", label: "HOME" }, ...links];

function isCurrent(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  const artistCaseStudy = /^\/work\/(molt-new-skin|vivi|eli-moss)$/.test(pathname);
  if (href === "/for-artists") return pathname === href || artistCaseStudy;
  if (href === "/work") return pathname.startsWith("/work") && !artistCaseStudy;
  return pathname === href;
}

export function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const menu = menuRef.current;
    const header = menu?.previousElementSibling;
    const pageRoot = menu?.parentElement;
    const backgroundElements = Array.from(pageRoot?.children ?? []).filter(
      (element): element is HTMLElement => element instanceof HTMLElement && element !== menu && element !== header,
    );
    const backgroundState = backgroundElements.map((element) => ({
      element,
      inert: element.inert,
      ariaHidden: element.getAttribute("aria-hidden"),
    }));
    for (const element of backgroundElements) {
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    }
    const menuLinks = Array.from(menu?.querySelectorAll<HTMLElement>("a[href]") ?? []);
    const focusable = [menuButtonRef.current, ...menuLinks].filter((element): element is HTMLElement => Boolean(element));
    const focusTimer = window.setTimeout(() => menuLinks[0]?.focus(), 190);

    const manageKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        requestAnimationFrame(() => menuButtonRef.current?.focus());
        return;
      }
      if (event.key !== "Tab" || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", manageKeyboard);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", manageKeyboard);
      for (const state of backgroundState) {
        state.element.inert = state.inert;
        if (state.ariaHidden === null) state.element.removeAttribute("aria-hidden");
        else state.element.setAttribute("aria-hidden", state.ariaHidden);
      }
    };
  }, [open]);

  return (
    <>
      <a className="skip-link" href="#main-content">SKIP TO CONTENT</a>
      <header className="site-header">
        <nav className="desktop-nav" aria-label="Primary navigation">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={isCurrent(pathname, link.href) ? "is-active" : ""}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="header-meta">
          {pathname !== "/" ? (
            <a className="home-back-link" href="/" aria-label="Back to Carmel Faraggi home">
              <span aria-hidden="true">←</span> HOME
            </a>
          ) : null}
          <a className="location location-top" href="/" aria-label="Carmel Faraggi home">
            LONDON, UK
          </a>
        </div>
        <button
          ref={menuButtonRef}
          className={`menu-toggle ${open ? "is-open" : ""}`}
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onPointerDown={() => menuButtonRef.current?.setAttribute("data-pointer", "")}
          onKeyDown={() => menuButtonRef.current?.removeAttribute("data-pointer")}
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <div
        ref={menuRef}
        id="mobile-menu"
        className={`mobile-menu ${open ? "is-open" : ""}`}
        role="dialog"
        aria-label="Site navigation"
        aria-modal="true"
        aria-hidden={!open}
      >
        <nav aria-label="Mobile navigation">
          {mobileLinks.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              tabIndex={open ? 0 : -1}
              className={isCurrent(pathname, link.href) ? "is-active" : ""}
              onClick={() => setOpen(false)}
              style={{ "--i": index } as React.CSSProperties}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <p className="mobile-menu-location">LONDON, UK</p>
      </div>
    </>
  );
}

"use client";

import { useEffect } from "react";

function track(event: string, detail: Record<string, string> = {}) {
  window.dispatchEvent(new CustomEvent("carmel:analytics", { detail: { event, ...detail } }));
}

export function ArtistAnalytics() {
  useEffect(() => {
    track("for_artists_page_view");
    const page = document.querySelector<HTMLElement>(".for-artists-page");
    if (!page) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-artist-event]") : null;
      if (!target) return;
      const detail: Record<string, string> = target.dataset.projectName ? { project: target.dataset.projectName } : {};
      track(target.dataset.artistEvent ?? "for_artists_interaction", detail);
    };

    page.addEventListener("click", handleClick);
    return () => page.removeEventListener("click", handleClick);
  }, []);

  return null;
}

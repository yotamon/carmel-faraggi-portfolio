"use client";

import { useRef } from "react";
import { coverSrcSet, selectedCovers } from "@/lib/artists";

/* eslint-disable @next/next/no-img-element -- vinext has no image optimizer; responsive sources are provided explicitly. */

function trackInteraction() {
  window.dispatchEvent(new CustomEvent("carmel:analytics", { detail: { event: "selected_covers_interaction" } }));
}

export function CoverRail() {
  const railRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, pointerId: 0, x: 0, scrollLeft: 0 });
  const tracked = useRef(false);

  function markInteraction() {
    if (tracked.current) return;
    tracked.current = true;
    trackInteraction();
  }

  function scroll(direction: -1 | 1) {
    const rail = railRef.current;
    if (!rail) return;
    markInteraction();
    rail.scrollBy({ left: direction * rail.clientWidth * 0.78, behavior: "auto" });
  }

  return (
    <div className="covers-explorer">
      <div
        ref={railRef}
        className="covers-rail"
        role="list"
        aria-label="Selected cover artwork"
        onScroll={markInteraction}
        onPointerDown={(event) => {
          if (event.pointerType !== "mouse" || event.button !== 0) return;
          const rail = event.currentTarget;
          drag.current = { active: true, pointerId: event.pointerId, x: event.clientX, scrollLeft: rail.scrollLeft };
          rail.setPointerCapture(event.pointerId);
          rail.classList.add("is-dragging");
          markInteraction();
        }}
        onPointerMove={(event) => {
          const state = drag.current;
          if (!state.active || state.pointerId !== event.pointerId) return;
          event.currentTarget.scrollLeft = state.scrollLeft - (event.clientX - state.x);
        }}
        onPointerUp={(event) => {
          if (drag.current.pointerId !== event.pointerId) return;
          drag.current.active = false;
          event.currentTarget.classList.remove("is-dragging");
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={(event) => {
          drag.current.active = false;
          event.currentTarget.classList.remove("is-dragging");
        }}
      >
        {selectedCovers.map((cover) => (
          <figure className="cover-artwork" role="listitem" key={cover.src}>
            <img
              src={cover.src}
              srcSet={coverSrcSet(cover)}
              sizes="(max-width: 767px) 38vw, (max-width: 1199px) 27vw, 190px"
              alt={cover.alt}
              width={cover.width}
              height={cover.width}
              loading="lazy"
              decoding="async"
            />
          </figure>
        ))}
      </div>
      <div className="covers-controls">
        <button type="button" aria-label="Previous covers" onClick={() => scroll(-1)}><span aria-hidden="true">←</span></button>
        <p>DRAG TO EXPLORE</p>
        <button type="button" aria-label="Next covers" onClick={() => scroll(1)}><span aria-hidden="true">→</span></button>
      </div>
    </div>
  );
}

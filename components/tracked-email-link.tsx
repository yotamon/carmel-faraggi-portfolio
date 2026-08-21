"use client";

import type { CSSProperties } from "react";

export function TrackedEmailLink() {
  return (
    <a
      href="mailto:carmelfaraggi@gmail.com"
      data-reveal
      style={{ "--item": 1 } as CSSProperties}
      onClick={() => window.dispatchEvent(new CustomEvent("carmel:analytics", { detail: { event: "contact_email_click" } }))}
    >
      carmelfaraggi@gmail.com
    </a>
  );
}

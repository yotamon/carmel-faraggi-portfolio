"use client";

export function TrackedEmailLink() {
  return (
    <a
      href="mailto:carmelfaraggi@gmail.com"
      onClick={() => window.dispatchEvent(new CustomEvent("carmel:analytics", { detail: { event: "contact_email_click" } }))}
    >
      carmelfaraggi@gmail.com
    </a>
  );
}

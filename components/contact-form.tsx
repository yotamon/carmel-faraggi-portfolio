"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

const options = [
  "Brand Identity",
  "Graphic Design / One-off Project",
  "Music / Artist Visuals",
  "Not Sure Yet",
];

type FormState = "idle" | "sending" | "success" | "error";
type FieldErrors = Partial<Record<"name" | "email" | "project", string>>;

function track(event: string) {
  window.dispatchEvent(new CustomEvent("carmel:analytics", { detail: { event } }));
}

export function ContactForm() {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const submissionKey = useRef<string | null>(null);
  const started = useRef(false);

  useEffect(() => track("contact_page_view"), []);

  function markStarted() {
    if (started.current) return;
    started.current = true;
    track("contact_form_start");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const project = String(formData.get("project") ?? "").trim();
    const nextErrors: FieldErrors = {};
    if (name.length < 2) nextErrors.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Please enter a valid email.";
    if (!project) nextErrors.project = "Tell me a little about the project.";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setState("error");
      setMessage("");
      const firstInvalid = Object.keys(nextErrors)[0];
      form.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    setErrors({});
    submissionKey.current ??= crypto.randomUUID();
    setState("sending");
    setMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...Object.fromEntries(formData.entries()), submissionKey: submissionKey.current }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Please check the form and try again.");
      setState("success");
      setMessage("Thanks — I’ll get back to you soon.");
      track("contact_form_submit_success");
      form.reset();
      submissionKey.current = null;
      started.current = false;
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong. Try again, or email me directly.");
      track("contact_form_submit_error");
    }
  }

  return (
    <form className="contact-form" onSubmit={submit} onFocusCapture={markStarted} noValidate>
      <div className={`field ${errors.name ? "has-error" : ""}`}>
        <label htmlFor="name">NAME</label>
        <input id="name" name="name" autoComplete="name" required minLength={2} maxLength={120} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} />
        {errors.name ? <p className="field-error" id="name-error">{errors.name}</p> : null}
      </div>
      <div className={`field ${errors.email ? "has-error" : ""}`}>
        <label htmlFor="email">EMAIL</label>
        <input id="email" name="email" type="email" inputMode="email" autoComplete="email" required maxLength={254} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} />
        {errors.email ? <p className="field-error" id="email-error">{errors.email}</p> : null}
      </div>
      <div className="field select-field">
        <label htmlFor="interest">WHAT ARE YOU LOOKING FOR?</label>
        <select id="interest" name="interest" defaultValue="" aria-label="What are you looking for? (optional)">
          <option value="" />
          {options.map((option) => <option key={option}>{option}</option>)}
        </select>
      </div>
      <div className={`field message-field ${errors.project ? "has-error" : ""}`}>
        <label htmlFor="project">TELL ME ABOUT THE PROJECT</label>
        <textarea
          id="project"
          name="project"
          required
          rows={5}
          maxLength={5000}
          aria-invalid={Boolean(errors.project)}
          aria-describedby={errors.project ? "project-error" : undefined}
          onInput={(event) => {
            const textarea = event.currentTarget;
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
          }}
        />
        {errors.project ? <p className="field-error" id="project-error">{errors.project}</p> : null}
      </div>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="company">Company website</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>
      <button className="send-button" type="submit" disabled={state === "sending"}>
        <span>{state === "sending" ? "SENDING…" : state === "success" ? "SENT ✓" : "SEND"}</span>
        {state !== "success" ? <span className="arrow" aria-hidden="true">→</span> : null}
      </button>
      <p className={`form-status ${state}`} role="status" aria-live="polite">{message}</p>
    </form>
  );
}

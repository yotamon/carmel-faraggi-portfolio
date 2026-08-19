"use client";

import { FormEvent, useRef, useState } from "react";

const options = [
  "Brand identity",
  "Graphic design",
  "Art direction",
  "Campaign / social",
  "Album / release artwork",
  "Print / packaging",
  "Something else",
];

type FormState = "idle" | "sending" | "success" | "error";

export function ContactForm() {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const submissionKey = useRef<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;
    const form = event.currentTarget;
    const formData = new FormData(form);
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
      setMessage("Thanks. Your message has been sent.");
      form.reset();
      submissionKey.current = null;
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="field">
        <label htmlFor="name">NAME</label>
        <input id="name" name="name" autoComplete="name" required minLength={2} />
      </div>
      <div className="field">
        <label htmlFor="email">EMAIL</label>
        <input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="field select-field">
        <label htmlFor="interest">WHAT ARE YOU LOOKING FOR?</label>
        <select id="interest" name="interest" defaultValue="" required>
          <option value="" disabled>Select a service</option>
          {options.map((option) => <option key={option}>{option}</option>)}
        </select>
      </div>
      <div className="field message-field">
        <label htmlFor="project">TELL ME ABOUT THE PROJECT</label>
        <textarea id="project" name="project" required minLength={12} rows={5} />
      </div>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="company">Company website</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>
      <button className="send-button" type="submit" disabled={state === "sending"}>
        <span>{state === "sending" ? "SENDING…" : "SEND"}</span>
        <span className="arrow" aria-hidden="true">→</span>
      </button>
      <p className={`form-status ${state}`} role="status" aria-live="polite">{message}</p>
    </form>
  );
}

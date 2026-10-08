import { env } from "cloudflare:workers";

const options = new Set([
  "Brand Identity",
  "Graphic Design",
  "One-off Project",
  "Music / Artist Visuals",
  "Not Sure Yet",
]);

type Inquiry = { name: string; email: string; interest: string; project: string };

type EmailBindings = {
  RESEND_API_KEY?: string;
  CONTACT_FROM_EMAIL?: string;
  CONTACT_NOTIFY_TO?: string;
};

async function notifyStudio(inquiry: Inquiry) {
  const config = env as unknown as EmailBindings;
  if (!config.RESEND_API_KEY || !config.CONTACT_FROM_EMAIL || !config.CONTACT_NOTIFY_TO) return;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "authorization": "Bearer " + config.RESEND_API_KEY, "content-type": "application/json" },
      body: JSON.stringify({
        from: config.CONTACT_FROM_EMAIL,
        to: [config.CONTACT_NOTIFY_TO],
        reply_to: inquiry.email,
        subject: "New project inquiry — Carmel Studio",
        text: [
          "A new inquiry was saved in Carmel Studio.",
          "",
          "Name: " + inquiry.name,
          "Email: " + inquiry.email,
          "Interest: " + (inquiry.interest || "Not specified"),
          "",
          inquiry.project,
          "",
          "Sign in to Carmel Studio to manage this inquiry.",
        ].join("\n"),
      }),
    });
    if (!response.ok) console.error("Contact email alert failed:", response.status);
  } catch (error) {
    console.error("Contact email alert could not be delivered.", error instanceof Error ? error.name : "Unknown error");
  }
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (text(body.company)) return Response.json({ ok: true }, { status: 201 });

    const name = text(body.name);
    const email = text(body.email).toLowerCase();
    const interest = text(body.interest);
    const project = text(body.project);
    const submissionKey = text(body.submissionKey);
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (name.length < 2) return Response.json({ error: "Please enter your name." }, { status: 400 });
    if (name.length > 120) return Response.json({ error: "Please keep your name under 120 characters." }, { status: 400 });
    if (email.length > 254) return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
    if (!emailValid) return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
    if (interest && !options.has(interest)) return Response.json({ error: "Please choose a valid service option." }, { status: 400 });
    if (!project) return Response.json({ error: "Tell me a little about the project." }, { status: 400 });
    if (project.length > 5000) return Response.json({ error: "Please keep the project description under 5,000 characters." }, { status: 400 });
    if (!/^[a-f0-9-]{20,80}$/i.test(submissionKey)) return Response.json({ error: "Please refresh the page and try again." }, { status: 400 });

    const db = env.DB;
    await db.prepare(`CREATE TABLE IF NOT EXISTS contact_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      interest TEXT NOT NULL,
      project TEXT NOT NULL,
      submission_key TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`).run();
    let alreadySaved = false;
    try {
      await db.prepare("INSERT INTO contact_submissions (name, email, interest, project, submission_key) VALUES (?, ?, ?, ?, ?)")
        .bind(name, email, interest, project, submissionKey)
        .run();
    } catch (error) {
      if (!(error instanceof Error) || !error.message.toLowerCase().includes("unique")) throw error;
      alreadySaved = true;
    }

    // Delivery to the studio inbox succeeds independently of optional email alerts.
    // Resend credentials must be configured as Cloudflare secrets / variables.
    if (!alreadySaved) await notifyStudio({ name, email, interest, project });

    return Response.json({ ok: true }, { status: 201 });
  } catch {
    return Response.json({ error: "Something went wrong. Try again, or email me directly." }, { status: 500 });
  }
}

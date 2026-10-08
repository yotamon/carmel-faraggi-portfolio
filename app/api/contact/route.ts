import { env } from "cloudflare:workers";

const options = new Set([
  "Brand Identity",
  "Graphic Design",
  "One-off Project",
  "Music / Artist Visuals",
  "Not Sure Yet",
]);

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
    try {
      await db.prepare("INSERT INTO contact_submissions (name, email, interest, project, submission_key) VALUES (?, ?, ?, ?, ?)")
        .bind(name, email, interest, project, submissionKey)
        .run();
    } catch (error) {
      if (!(error instanceof Error) || !error.message.toLowerCase().includes("unique")) throw error;
    }

    return Response.json({ ok: true }, { status: 201 });
  } catch {
    return Response.json({ error: "Something went wrong. Try again, or email me directly." }, { status: 500 });
  }
}

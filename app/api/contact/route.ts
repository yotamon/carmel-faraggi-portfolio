import { env } from "cloudflare:workers";

const options = new Set([
  "Brand identity",
  "Graphic design",
  "Art direction",
  "Campaign / social",
  "Album / release artwork",
  "Print / packaging",
  "Something else",
]);

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (clean(body.company, 100)) return Response.json({ ok: true }, { status: 201 });

    const name = clean(body.name, 120);
    const email = clean(body.email, 254).toLowerCase();
    const interest = clean(body.interest, 80);
    const project = clean(body.project, 5000);
    const submissionKey = clean(body.submissionKey, 80);
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (name.length < 2) return Response.json({ error: "Please enter your name." }, { status: 400 });
    if (!emailValid) return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
    if (!options.has(interest)) return Response.json({ error: "Please select what you are looking for." }, { status: 400 });
    if (project.length < 12) return Response.json({ error: "Please tell me a little more about the project." }, { status: 400 });
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
    return Response.json({ error: "Your message could not be sent just now. Please email me directly instead." }, { status: 500 });
  }
}

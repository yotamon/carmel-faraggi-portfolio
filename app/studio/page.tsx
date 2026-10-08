import type { Metadata } from "next";
import { chatGPTSignInPath, chatGPTSignOutPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { StudioDashboard } from "@/components/studio/studio-dashboard";
import { listStudioProjects } from "@/lib/portfolio-store";
import { getStudioAccess } from "@/lib/studio-auth";
import { cleanupStaleStudioMedia } from "@/lib/studio-media";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Carmel Studio",
  description: "Private portfolio content studio for Carmel Faraggi.",
  robots: { index: false, follow: false, nocache: true },
};

function safeReturnTo(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/studio") || value.startsWith("//")) return "/studio";
  return value;
}

export default async function StudioPage({
  searchParams,
}: {
  searchParams: Promise<{ return_to?: string; denied?: string }>;
}) {
  const query = await searchParams;
  const user = await getChatGPTUser();
  const returnTo = safeReturnTo(query.return_to);

  if (!user) {
    return (
      <main className="studio-gate">
        <section className="studio-gate-card" aria-labelledby="studio-signin-title">
          <p className="studio-kicker">PRIVATE CONTENT STUDIO</p>
          <h1 id="studio-signin-title" className="display">CARMEL<br />STUDIO</h1>
          <p className="studio-gate-lead">Upload, arrange and publish portfolio projects without touching code or GitHub.</p>
          <a className="studio-primary-button" href={chatGPTSignInPath(returnTo)}>SIGN IN WITH CHATGPT <span aria-hidden="true">→</span></a>
          <div className="studio-privacy-note">
            <strong>What sign-in shares</strong>
            <p>Carmel Studio receives your ChatGPT user ID, email address and optional display name only to verify editing access. It does not receive your conversations.</p>
          </div>
          <a className="studio-text-link" href="/">← BACK TO PORTFOLIO</a>
        </section>
      </main>
    );
  }

  const access = await getStudioAccess(user);
  if (!access.allowed) {
    return (
      <main className="studio-gate">
        <section className="studio-gate-card" aria-labelledby="studio-denied-title">
          <p className="studio-kicker">PRIVATE CONTENT STUDIO</p>
          <h1 id="studio-denied-title" className="display">{access.unavailable ? "STUDIO\nOFFLINE" : "NO\nACCESS"}</h1>
          <p className="studio-gate-lead">
            {access.unavailable
              ? "The content database is temporarily unavailable. The public portfolio is still safe; try again shortly."
              : "This ChatGPT account is signed in, but it is not approved to edit Carmel’s portfolio."}
          </p>
          <a className="studio-primary-button" href={chatGPTSignOutPath("/studio")}>SIGN OUT <span aria-hidden="true">→</span></a>
          <a className="studio-text-link" href="/">← BACK TO PORTFOLIO</a>
        </section>
      </main>
    );
  }

  const projects = await listStudioProjects();
  await cleanupStaleStudioMedia();
  return (
    <StudioDashboard
      initialProjects={projects}
      userName={user.fullName ?? user.email}
      signOutHref={chatGPTSignOutPath("/")}
    />
  );
}

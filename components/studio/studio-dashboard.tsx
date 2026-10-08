"use client";

import { useState } from "react";
import type { Project } from "@/lib/projects";
import type { StudioProject } from "@/lib/studio-types";

/* eslint-disable @next/next/no-img-element -- Studio previews R2 and portfolio images directly. */

function statusLabel(status: StudioProject["status"]) {
  if (status === "published") return "Published";
  if (status === "archived") return "Archived";
  return "Draft";
}

export function StudioDashboard({
  initialProjects,
  newInquiryCount,
  userName,
  signOutHref,
}: {
  initialProjects: StudioProject[];
  newInquiryCount: number;
  userName: string;
  signOutHref: string;
}) {
  const [projects, setProjects] = useState(initialProjects);
  const [dragging, setDragging] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const activeFor = (group: Project["group"]) =>
    projects.filter((project) => project.group === group && project.status !== "archived")
      .sort((a, b) => a.sortOrder - b.sortOrder);
  const archived = projects.filter((project) => project.status === "archived");
  const publishedCount = projects.filter((project) => project.status === "published").length;
  const draftCount = projects.filter((project) => project.status === "draft").length;

  async function persistOrder(group: Project["group"], nextGroup: StudioProject[]) {
    const ids = nextGroup.map((project) => project.id);
    const previousProjects = projects;
    setProjects((current) => {
      const order = new Map(ids.map((id, index) => [id, (index + 1) * 10]));
      return current.map((project) => order.has(project.id) ? { ...project, sortOrder: order.get(project.id)! } : project);
    });
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/studio/projects/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group, ids }),
      });
      const json = await response.json() as { projects?: StudioProject[]; error?: string };
      if (!response.ok || !json.projects) throw new Error(json.error || "Could not save the new order.");
      setProjects(json.projects);
      setMessage("Project order saved.");
    } catch (error) {
      setProjects(previousProjects);
      setMessage(error instanceof Error ? error.message : "Could not save the new order.");
    } finally {
      setBusy(false);
    }
  }

  function moveProject(group: Project["group"], id: string, delta: number) {
    const list = activeFor(group);
    const index = list.findIndex((project) => project.id === id);
    const target = index + delta;
    if (index < 0 || target < 0 || target >= list.length) return;
    const next = [...list];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    void persistOrder(group, next);
  }

  function dropProject(group: Project["group"], targetId: string) {
    if (!dragging || dragging === targetId) return;
    const list = activeFor(group);
    const from = list.findIndex((project) => project.id === dragging);
    const to = list.findIndex((project) => project.id === targetId);
    if (from < 0 || to < 0) return;
    const next = [...list];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setDragging(null);
    void persistOrder(group, next);
  }

  async function archive(project: StudioProject) {
    if (!window.confirm("Archive “" + project.title + "”? It will disappear from the public portfolio but stay available in Studio.")) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/studio/projects/" + encodeURIComponent(project.id), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version: project.version }),
      });
      const json = await response.json() as { project?: StudioProject; error?: string };
      if (!response.ok || !json.project) throw new Error(json.error || "Could not archive the project.");
      setProjects((current) => current.map((item) => item.id === project.id ? json.project! : item));
      setMessage("Project archived.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not archive the project.");
    } finally {
      setBusy(false);
    }
  }

  function section(group: Project["group"], title: string, description: string) {
    const list = activeFor(group);
    return (
      <section className="studio-project-section" aria-labelledby={"studio-" + group}>
        <div className="studio-section-heading">
          <div>
            <p className="studio-kicker">{description}</p>
            <h2 id={"studio-" + group}>{title}</h2>
          </div>
          <span>{list.length} PROJECT{list.length === 1 ? "" : "S"}</span>
        </div>
        {list.length ? (
          <div className="studio-project-list">
            {list.map((project, index) => (
              <article
                className={"studio-project-row " + (dragging === project.id ? "is-dragging" : "")}
                draggable={!busy}
                onDragStart={() => setDragging(project.id)}
                onDragEnd={() => setDragging(null)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => dropProject(group, project.id)}
                key={project.id}
              >
                <span className="studio-drag-handle" aria-hidden="true">⋮⋮</span>
                <div className="studio-project-thumb">
                  {project.hero ? <img src={project.hero} alt="" /> : <span>NO COVER</span>}
                </div>
                <div className="studio-project-summary">
                  <div className="studio-project-title-line">
                    <h3>{project.title}</h3>
                    <span className={"studio-status studio-status-" + project.status}>{statusLabel(project.status)}</span>
                  </div>
                  <p>{project.category} · {project.year}</p>
                </div>
                <div className="studio-order-controls" aria-label={"Move " + project.title}>
                  <button type="button" onClick={() => moveProject(group, project.id, -1)} disabled={busy || index === 0} aria-label="Move project up">↑</button>
                  <button type="button" onClick={() => moveProject(group, project.id, 1)} disabled={busy || index === list.length - 1} aria-label="Move project down">↓</button>
                </div>
                <div className="studio-row-actions">
                  <a href={"/studio/preview/" + project.id}>PREVIEW</a>
                  <a className="studio-row-primary" href={"/studio/" + project.id}>EDIT</a>
                  <button type="button" onClick={() => void archive(project)} disabled={busy}>ARCHIVE</button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="studio-empty-state">No projects here yet.</p>
        )}
      </section>
    );
  }

  return (
    <main className="studio-app">
      <header className="studio-topbar">
        <a className="studio-brand" href="/studio"><span>CARMEL</span><strong>STUDIO</strong></a>
        <div className="studio-topbar-actions">
          <a href="/studio/inbox">INBOX{newInquiryCount ? " (" + newInquiryCount + ")" : ""}</a>
          <a href="/studio/content">SITE CONTENT</a>
          <a href="/studio/covers">COVERS</a>
          <a href="/studio/insights">INSIGHTS</a>
          <a href="/" target="_blank" rel="noreferrer">VIEW SITE ↗</a>
          <span className="studio-user">{userName}</span>
          <a href={signOutHref}>SIGN OUT</a>
        </div>
      </header>

      <div className="studio-dashboard">
        <section className="studio-dashboard-hero">
          <div>
            <p className="studio-kicker">PORTFOLIO CONTENT</p>
            <h1 className="display">YOUR WORK,<br />YOUR CONTROL.</h1>
            <p>Upload projects, reorder them and publish when they are ready. The portfolio design stays protected.</p>
          </div>
          <a className="studio-primary-button" href="/studio/new">+ NEW PROJECT</a>
        </section>

        <section className="studio-stats" aria-label="Portfolio status">
          <div><strong>{publishedCount}</strong><span>PUBLISHED</span></div>
          <div><strong>{draftCount}</strong><span>DRAFTS</span></div>
          <div><strong>{projects.length}</strong><span>TOTAL</span></div>
        </section>

        <p className="studio-live-message" aria-live="polite">{busy ? "Saving…" : message}</p>
        {section("commercial", "WORK", "BRANDS + COMMERCIAL")}
        {section("music-culture", "FOR ARTISTS", "MUSIC + CULTURE")}

        {archived.length ? (
          <section className="studio-project-section studio-archive-section" aria-labelledby="studio-archive">
            <div className="studio-section-heading">
              <div><p className="studio-kicker">HIDDEN FROM THE SITE</p><h2 id="studio-archive">ARCHIVE</h2></div>
              <span>{archived.length}</span>
            </div>
            <div className="studio-archive-grid">
              {archived.map((project) => (
                <a href={"/studio/" + project.id} key={project.id}>
                  <strong>{project.title}</strong>
                  <span>{project.category} · EDIT / RESTORE →</span>
                </a>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

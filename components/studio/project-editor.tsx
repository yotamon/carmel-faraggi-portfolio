"use client";

import { prepareStudioImage } from "@/lib/client-image";

import { useEffect, useMemo, useState } from "react";
import type { StudioProject, StudioProjectPayload, UploadedStudioMedia } from "@/lib/studio-types";

/* eslint-disable @next/next/no-img-element -- Studio previews uploaded and existing portfolio media directly. */

const categorySuggestions = [
  "FOOD + HOSPITALITY",
  "BEAUTY + WELLNESS",
  "RETAIL + LIFESTYLE",
  "MUSIC + CULTURE",
  "FASHION + CULTURE",
  "BRAND IDENTITY",
];

const serviceSuggestions = [
  "Brand identity",
  "Art direction",
  "Campaign",
  "Campaign design",
  "Packaging",
  "Digital",
  "Print",
  "Social",
  "Character design",
  "Artist identity",
  "Release artwork",
  "Release visuals",
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function payloadFromProject(project: StudioProject): StudioProjectPayload {
  return {
    title: project.title,
    slug: project.slug,
    category: project.category,
    group: project.group,
    year: project.year,
    services: [...project.services],
    layout: project.layout,
    description: project.description,
    hero: project.hero,
    heroAlt: project.heroAlt,
    heroWidth: project.heroWidth,
    heroHeight: project.heroHeight,
    heroStorageKey: project.heroStorageKey,
    gallery: project.gallery.map((image) => ({
      src: image.src,
      alt: image.alt,
      caption: image.caption ?? "",
      width: image.width ?? 1,
      height: image.height ?? 1,
      storageKey: image.storageKey,
    })),
    status: project.status,
    version: project.version,
  };
}

function emptyProject(): StudioProjectPayload {
  return {
    title: "",
    slug: "",
    category: "BRAND IDENTITY",
    group: "commercial",
    year: String(new Date().getFullYear()),
    services: [],
    layout: "left",
    description: "",
    hero: "",
    heroAlt: "",
    heroWidth: 1,
    heroHeight: 1,
    heroStorageKey: null,
    gallery: [],
    status: "draft",
    version: 0,
  };
}

function projectMediaKeys(project: StudioProject | null) {
  const keys: string[] = [];
  if (project?.heroStorageKey) keys.push(project.heroStorageKey);
  for (const image of project?.gallery ?? []) if (image.storageKey) keys.push(image.storageKey);
  return keys;
}

export function StudioProjectEditor({ initialProject }: { initialProject: StudioProject | null }) {
  const [form, setForm] = useState<StudioProjectPayload>(() => initialProject ? payloadFromProject(initialProject) : emptyProject());
  const [serviceInput, setServiceInput] = useState("");
  const [slugTouched, setSlugTouched] = useState(Boolean(initialProject));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"ok" | "error" | "">("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [attachedKeys, setAttachedKeys] = useState<Set<string>>(() => new Set(projectMediaKeys(initialProject)));

  const projectId = initialProject?.id ?? null;
  const canPreview = Boolean(projectId);
  const publishChecklist = useMemo(() => {
    const missing: string[] = [];
    if (!form.title.trim()) missing.push("title");
    if (!form.slug.trim()) missing.push("URL slug");
    if (!form.description.trim()) missing.push("description");
    if (!form.hero) missing.push("cover image");
    if (form.hero && !form.heroAlt.trim()) missing.push("cover alt text");
    if (form.gallery.some((image) => !image.alt.trim())) missing.push("gallery alt text");
    return missing;
  }, [form]);

  useEffect(() => {
    function beforeUnload(event: BeforeUnloadEvent) {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);


  function update<K extends keyof StudioProjectPayload>(key: K, value: StudioProjectPayload[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setDirty(true);
  }

  function updateTitle(value: string) {
    setForm((current) => ({
      ...current,
      title: value,
      slug: slugTouched ? current.slug : slugify(value),
    }));
    setDirty(true);
  }

  function addService(raw = serviceInput) {
    const value = raw.trim();
    if (!value || form.services.includes(value) || form.services.length >= 12) return;
    update("services", [...form.services, value]);
    setServiceInput("");
  }

  function removeService(service: string) {
    update("services", form.services.filter((item) => item !== service));
  }

  async function upload(file: File): Promise<UploadedStudioMedia> {
    const prepared = await prepareStudioImage(file);
    const data = new FormData();
    data.set("file", prepared.file);
    data.set("width", String(prepared.width));
    data.set("height", String(prepared.height));
    const response = await fetch("/api/studio/media", { method: "POST", body: data });
    const json = await response.json() as { media?: UploadedStudioMedia; error?: string };
    if (!response.ok || !json.media) throw new Error(json.error || "The image could not be uploaded.");
    return json.media;
  }

  async function deleteTemporaryMedia(key: string | null) {
    if (!key || attachedKeys.has(key)) return;
    try {
      await fetch("/api/studio/media?key=" + encodeURIComponent(key), { method: "DELETE" });
    } catch {
      // Stale, unattached uploads are also cleaned automatically later.
    }
  }

  async function uploadHero(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setMessage("Uploading cover image…");
    setMessageType("");
    try {
      const media = await upload(file);
      await deleteTemporaryMedia(form.heroStorageKey);
      setForm((current) => ({
        ...current,
        hero: media.src,
        heroStorageKey: media.storageKey,
        heroWidth: media.width,
        heroHeight: media.height,
        heroAlt: current.heroAlt || (current.title.trim() ? current.title.trim() + " project cover" : ""),
      }));
      setDirty(true);
      setMessage("Cover image ready.");
      setMessageType("ok");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The cover image could not be uploaded.");
      setMessageType("error");
    } finally {
      setUploading(false);
    }
  }

  async function uploadGallery(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setMessage("Uploading " + files.length + " image" + (files.length === 1 ? "" : "s") + "…");
    setMessageType("");
    let added = 0;
    try {
      for (const file of Array.from(files)) {
        const media = await upload(file);
        setForm((current) => ({
          ...current,
          gallery: [
            ...current.gallery,
            {
              src: media.src,
              storageKey: media.storageKey,
              alt: "",
              caption: "",
              width: media.width,
              height: media.height,
            },
          ],
        }));
        added += 1;
      }
      setDirty(true);
      setMessage(added + " gallery image" + (added === 1 ? "" : "s") + " ready. Add alt text before publishing.");
      setMessageType("ok");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "One of the gallery images could not be uploaded.");
      setMessageType("error");
    } finally {
      setUploading(false);
    }
  }

  async function removeHero() {
    await deleteTemporaryMedia(form.heroStorageKey);
    setForm((current) => ({ ...current, hero: "", heroStorageKey: null, heroWidth: 1, heroHeight: 1, heroAlt: "" }));
    setDirty(true);
  }

  async function removeGallery(index: number) {
    const image = form.gallery[index];
    await deleteTemporaryMedia(image?.storageKey ?? null);
    update("gallery", form.gallery.filter((_, itemIndex) => itemIndex !== index));
  }

  function moveGallery(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= form.gallery.length) return;
    const next = [...form.gallery];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    update("gallery", next);
  }

  function dropGallery(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const next = [...form.gallery];
    const [item] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, item);
    setDragIndex(null);
    update("gallery", next);
  }

  async function save(statusOverride?: StudioProjectPayload["status"]) {
    if (saving || uploading) return;
    setSaving(true);
    setMessage("");
    setMessageType("");
    const payload: StudioProjectPayload = {
      ...form,
      status: statusOverride ?? form.status,
      version: form.version,
    };
    try {
      const endpoint = projectId ? "/api/studio/projects/" + encodeURIComponent(projectId) : "/api/studio/projects";
      const response = await fetch(endpoint, {
        method: projectId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await response.json() as { project?: StudioProject; error?: string };
      if (!response.ok || !json.project) throw new Error(json.error || "The project could not be saved.");
      const saved = json.project;
      setForm(payloadFromProject(saved));
      setAttachedKeys(new Set(projectMediaKeys(saved)));
      setDirty(false);
      setMessage(saved.status === "published" ? "Published. The public portfolio is up to date." : saved.status === "archived" ? "Project archived." : "Draft saved.");
      setMessageType("ok");
      if (!projectId) {
        window.location.replace("/studio/" + saved.id + "?created=1");
        return;
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The project could not be saved.");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  async function archive() {
    if (!projectId || saving) return;
    if (!window.confirm("Archive “" + form.title + "”? It will disappear from the public portfolio but remain editable in Studio.")) return;
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/studio/projects/" + encodeURIComponent(projectId), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version: form.version }),
      });
      const json = await response.json() as { project?: StudioProject; error?: string };
      if (!response.ok || !json.project) throw new Error(json.error || "The project could not be archived.");
      setDirty(false);
      window.location.href = "/studio";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The project could not be archived.");
      setMessageType("error");
      setSaving(false);
    }
  }

  const disabled = saving || uploading;

  return (
    <main className="studio-app studio-editor-app">
      <header className="studio-topbar">
        <a className="studio-brand" href="/studio"><span>CARMEL</span><strong>STUDIO</strong></a>
        <div className="studio-topbar-actions">
          {canPreview ? <a href={"/studio/preview/" + projectId} target="_blank" rel="noreferrer">PREVIEW SAVED ↗</a> : null}
          <a href="/studio">ALL PROJECTS</a>
        </div>
      </header>

      <form className="studio-editor" onSubmit={(event) => { event.preventDefault(); void save(); }}>
        <header className="studio-editor-header">
          <div>
            <p className="studio-kicker">{projectId ? "EDIT PROJECT" : "NEW PROJECT"}</p>
            <h1 className="display">{form.title.trim() || "UNTITLED"}</h1>
            <div className="studio-editor-status-line">
              <span className={"studio-status studio-status-" + form.status}>{form.status.toUpperCase()}</span>
              {dirty ? <span>UNSAVED CHANGES</span> : <span>ALL CHANGES SAVED</span>}
            </div>
          </div>
          <div className="studio-editor-actions">
            {form.status === "published" ? (
              <>
                <button className="studio-secondary-button" type="button" onClick={() => void save("draft")} disabled={disabled}>UNPUBLISH</button>
                <button className="studio-primary-button" type="button" onClick={() => void save("published")} disabled={disabled}>SAVE CHANGES</button>
              </>
            ) : form.status === "archived" ? (
              <button className="studio-primary-button" type="button" onClick={() => void save("draft")} disabled={disabled}>RESTORE AS DRAFT</button>
            ) : (
              <>
                <button className="studio-secondary-button" type="button" onClick={() => void save("draft")} disabled={disabled}>SAVE DRAFT</button>
                <button className="studio-primary-button" type="button" onClick={() => void save("published")} disabled={disabled}>PUBLISH</button>
              </>
            )}
          </div>
        </header>

        <p className={"studio-form-message " + (messageType ? "is-" + messageType : "")} aria-live="polite">
          {saving ? "Saving…" : uploading ? "Processing image…" : message}
        </p>

        <div className="studio-editor-grid">
          <section className="studio-editor-panel studio-editor-panel-main" aria-labelledby="studio-content-heading">
            <div className="studio-panel-heading">
              <span>01</span>
              <div><h2 id="studio-content-heading">PROJECT CONTENT</h2><p>The words visitors will read on the project page.</p></div>
            </div>

            <label className="studio-field">
              <span>PROJECT TITLE *</span>
              <input value={form.title} onChange={(event) => updateTitle(event.target.value)} maxLength={120} placeholder="e.g. FLOWER TRAFFIC" required />
            </label>

            <div className="studio-two-column">
              <label className="studio-field">
                <span>CATEGORY *</span>
                <input list="studio-categories" value={form.category} onChange={(event) => update("category", event.target.value)} maxLength={80} required />
                <datalist id="studio-categories">{categorySuggestions.map((category) => <option value={category} key={category} />)}</datalist>
              </label>
              <label className="studio-field">
                <span>YEAR *</span>
                <input value={form.year} onChange={(event) => update("year", event.target.value)} maxLength={20} inputMode="numeric" required />
              </label>
            </div>

            <label className="studio-field">
              <span>DESCRIPTION {form.status === "published" ? "*" : ""}</span>
              <textarea value={form.description} onChange={(event) => update("description", event.target.value)} maxLength={5000} rows={7} placeholder="Describe the context, the creative idea and what you designed. Separate paragraphs with a blank line." />
              <small>{form.description.length}/5000</small>
            </label>

            <fieldset className="studio-field studio-services-field">
              <legend>SERVICES</legend>
              <div className="studio-service-tags">
                {form.services.map((service) => (
                  <button type="button" className="studio-service-tag" onClick={() => removeService(service)} key={service}>
                    {service}<span aria-hidden="true">×</span><span className="visually-hidden">Remove {service}</span>
                  </button>
                ))}
              </div>
              <div className="studio-inline-input">
                <input
                  value={serviceInput}
                  onChange={(event) => setServiceInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === ",") {
                      event.preventDefault();
                      addService();
                    }
                  }}
                  placeholder="Add a service"
                  maxLength={80}
                />
                <button type="button" onClick={() => addService()} disabled={!serviceInput.trim()}>ADD</button>
              </div>
              <div className="studio-service-suggestions">
                {serviceSuggestions.filter((service) => !form.services.includes(service)).slice(0, 8).map((service) => (
                  <button type="button" onClick={() => addService(service)} key={service}>+ {service}</button>
                ))}
              </div>
            </fieldset>
          </section>

          <aside className="studio-editor-panel studio-editor-panel-settings" aria-labelledby="studio-settings-heading">
            <div className="studio-panel-heading">
              <span>02</span>
              <div><h2 id="studio-settings-heading">DISPLAY</h2><p>Safe presentation controls.</p></div>
            </div>
            <label className="studio-field">
              <span>PROJECT AREA</span>
              <select value={form.group} onChange={(event) => update("group", event.target.value as StudioProjectPayload["group"])}>
                <option value="commercial">Work / Commercial</option>
                <option value="music-culture">For Artists / Music + Culture</option>
              </select>
            </label>
            <label className="studio-field">
              <span>CARD LAYOUT</span>
              <select value={form.layout} onChange={(event) => update("layout", event.target.value as StudioProjectPayload["layout"])}>
                <option value="left">Artwork left</option>
                <option value="right">Artwork right</option>
                <option value="wide">Wide</option>
              </select>
            </label>
            <label className="studio-field">
              <span>URL SLUG</span>
              <div className="studio-slug-field">
                <span>/work/</span>
                <input
                  value={form.slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    update("slug", slugify(event.target.value));
                  }}
                  maxLength={80}
                  required
                />
              </div>
              <small>Changing this changes the public project URL. The previous URL will redirect automatically.</small>
            </label>
            <div className="studio-publish-check">
              <strong>READY TO PUBLISH</strong>
              {publishChecklist.length ? (
                <p>Still needed: {publishChecklist.join(", ")}.</p>
              ) : (
                <p className="is-complete">Everything required for publishing is ready.</p>
              )}
            </div>
          </aside>

          <section className="studio-editor-panel studio-editor-panel-wide" aria-labelledby="studio-cover-heading">
            <div className="studio-panel-heading">
              <span>03</span>
              <div><h2 id="studio-cover-heading">COVER IMAGE</h2><p>This is the image shown on the Work page and at the top of the case study.</p></div>
            </div>
            <div
              className={"studio-upload-zone " + (form.hero ? "has-image" : "")}
              onDragOver={(event) => {
                if (disabled) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = "copy";
              }}
              onDrop={(event) => {
                if (disabled) return;
                event.preventDefault();
                void uploadHero(event.dataTransfer.files?.[0]);
              }}
            >
              {form.hero ? (
                <div className="studio-cover-preview">
                  <img src={form.hero} alt={form.heroAlt || ""} />
                  <div>
                    <span>{form.heroWidth} × {form.heroHeight}px</span>
                    <button type="button" onClick={() => void removeHero()} disabled={disabled}>REMOVE</button>
                  </div>
                </div>
              ) : (
                <div className="studio-upload-empty">
                  <strong>DROP IN A STRONG COVER</strong>
                  <span>JPEG, PNG or WebP · up to 25 MB · automatically optimized</span>
                </div>
              )}
              <label className="studio-upload-button">
                <span>{form.hero ? "REPLACE COVER" : "UPLOAD COVER"}</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { void uploadHero(event.target.files?.[0]); event.currentTarget.value = ""; }} disabled={disabled} />
              </label>
            </div>
            {form.hero ? (
              <label className="studio-field studio-alt-field">
                <span>COVER ALT TEXT *</span>
                <input value={form.heroAlt} onChange={(event) => update("heroAlt", event.target.value)} maxLength={300} placeholder="Describe what is visible in the image." />
                <small>Used by screen readers and helpful for image SEO.</small>
              </label>
            ) : null}
          </section>

          <section className="studio-editor-panel studio-editor-panel-wide" aria-labelledby="studio-gallery-heading">
            <div className="studio-panel-heading studio-gallery-heading">
              <span>04</span>
              <div><h2 id="studio-gallery-heading">CASE STUDY GALLERY</h2><p>Drag to reorder. The portfolio controls spacing and presentation automatically.</p></div>
              <label className="studio-upload-button studio-gallery-upload">
                <span>+ ADD IMAGES</span>
                <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(event) => { void uploadGallery(event.target.files); event.currentTarget.value = ""; }} disabled={disabled} />
              </label>
            </div>

            {form.gallery.length ? (
              <div className="studio-gallery-editor">
                {form.gallery.map((image, index) => (
                  <article
                    className={"studio-gallery-item " + (dragIndex === index ? "is-dragging" : "")}
                    draggable={!disabled}
                    onDragStart={() => setDragIndex(index)}
                    onDragEnd={() => setDragIndex(null)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => dropGallery(index)}
                    key={(image.storageKey || image.src) + "-" + index}
                  >
                    <div className="studio-gallery-image-wrap">
                      <img src={image.src} alt="" />
                      <span className="studio-gallery-index">{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <div className="studio-gallery-item-fields">
                      <label className="studio-field">
                        <span>ALT TEXT *</span>
                        <input
                          value={image.alt}
                          maxLength={300}
                          onChange={(event) => {
                            const next = [...form.gallery];
                            next[index] = { ...next[index], alt: event.target.value };
                            update("gallery", next);
                          }}
                          placeholder="Describe this image."
                        />
                      </label>
                      <label className="studio-field">
                        <span>VISIBLE CAPTION (OPTIONAL)</span>
                        <input
                          value={image.caption ?? ""}
                          maxLength={400}
                          onChange={(event) => {
                            const next = [...form.gallery];
                            next[index] = { ...next[index], caption: event.target.value };
                            update("gallery", next);
                          }}
                          placeholder="A short sentence about this artwork or application."
                        />
                        <small>Leave blank to show the image without a caption.</small>
                      </label>
                      <div className="studio-gallery-meta">
                        <span>{image.width} × {image.height}px</span>
                        <div>
                          <button type="button" onClick={() => moveGallery(index, -1)} disabled={disabled || index === 0} aria-label="Move image earlier">↑</button>
                          <button type="button" onClick={() => moveGallery(index, 1)} disabled={disabled || index === form.gallery.length - 1} aria-label="Move image later">↓</button>
                          <button type="button" className="is-danger" onClick={() => void removeGallery(index)} disabled={disabled}>REMOVE</button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="studio-gallery-empty">
                <strong>NO GALLERY IMAGES YET</strong>
                <span>Add the project story in the order you want people to experience it.</span>
              </div>
            )}
          </section>
        </div>

        <footer className="studio-editor-footer">
          <div>
            {projectId && form.status !== "archived" ? <button type="button" className="studio-danger-button" onClick={() => void archive()} disabled={disabled}>ARCHIVE PROJECT</button> : null}
          </div>
          <div className="studio-editor-actions">
            <a className="studio-secondary-button" href="/studio">CANCEL</a>
            {form.status === "published" ? (
              <button className="studio-primary-button" type="button" onClick={() => void save("published")} disabled={disabled}>SAVE CHANGES</button>
            ) : form.status === "archived" ? (
              <button className="studio-primary-button" type="button" onClick={() => void save("draft")} disabled={disabled}>RESTORE AS DRAFT</button>
            ) : (
              <>
                <button className="studio-secondary-button" type="button" onClick={() => void save("draft")} disabled={disabled}>SAVE DRAFT</button>
                <button className="studio-primary-button" type="button" onClick={() => void save("published")} disabled={disabled}>PUBLISH</button>
              </>
            )}
          </div>
        </footer>
      </form>
    </main>
  );
}

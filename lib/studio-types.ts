import type { Project } from "@/lib/projects";

export type ProjectStatus = "draft" | "published" | "archived";

export type StudioImage = Project["gallery"][number] & {
  id: string;
  storageKey: string | null;
  sortOrder: number;
};

export type StudioProject = Omit<Project, "gallery"> & {
  id: string;
  status: ProjectStatus;
  sortOrder: number;
  version: number;
  heroStorageKey: string | null;
  gallery: StudioImage[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

export type StudioProjectPayload = {
  title: string;
  slug: string;
  category: string;
  group: Project["group"];
  year: string;
  services: string[];
  layout: Project["layout"];
  description: string;
  hero: string;
  heroAlt: string;
  heroWidth: number;
  heroHeight: number;
  heroStorageKey: string | null;
  gallery: Array<{
    src: string;
    alt: string;
    caption?: string;
    width: number;
    height: number;
    storageKey: string | null;
  }>;
  status: ProjectStatus;
  version?: number;
};

export type UploadedStudioMedia = {
  src: string;
  storageKey: string;
  width: number;
  height: number;
  contentType: string;
  sizeBytes: number;
};

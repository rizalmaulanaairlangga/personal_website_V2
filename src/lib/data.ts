import type { SupabaseClient } from "@supabase/supabase-js";
import { Project, ProjectScreenshot, ScreenshotGalleryRole } from "./types";

export const BUCKET = "portfolio-proyek";

export const SORT_ORDER: Record<string, number> = {
  hero: -1,
  mobile: 0,
  mobile2: 1,
  mobile3: 2,
  tablet: 1,
  desktop: 3,
};

export const VIEW_TYPE_BY_ROLE: Record<ScreenshotGalleryRole, ProjectScreenshot["view_type"]> = {
  mobile: "mobile",
  mobile2: "mobile",
  mobile3: "mobile",
  tablet: "tablet",
  desktop: "desktop",
};

/** Filesystem-safe slug used to name stored files. */
export const fileSlug = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/**
 * Storage convention already used by the existing bucket:
 *   <Project Name>/Foto/<role>-<slug>.<ext>
 *
 * A short suffix is appended so a replacement never overwrites the object the
 * database still points at. The previous file stays in place until the
 * database save succeeds, and is only removed afterwards.
 */
export function buildStoragePath(
  projectName: string,
  role: string,
  originalFileName: string
): { path: string; fileName: string } {
  const ext = originalFileName.split(".").pop()?.toLowerCase() || "png";
  const suffix = Math.random().toString(36).slice(2, 8);
  const fileName = `${role}-${fileSlug(projectName)}-${suffix}.${ext}`;
  return { path: `${projectName}/Foto/${fileName}`, fileName };
}

export const publicUrlFor = (path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;

/** True when any project or screenshot row still points at this object. */
export async function isPathReferenced(
  client: SupabaseClient,
  path: string
): Promise<boolean> {
  const { data: project, error: projectError } = await client
    .from("proyek_web")
    .select("id")
    .eq("foto_storage_path", path)
    .limit(1)
    .maybeSingle();

  if (projectError) {
    throw new Error(`Could not check project references for ${path}: ${projectError.message}`);
  }
  if (project) return true;

  const { data: shots, error: screenshotsError } = await client
    .from("project_screenshots")
    .select("id")
    .eq("image_path", path)
    .limit(1);

  if (screenshotsError) {
    throw new Error(`Could not check screenshot references for ${path}: ${screenshotsError.message}`);
  }
  return Boolean(shots && shots.length > 0);
}

/**
 * Removes a Storage object, but only once nothing references it. Returns
 * whether the object was actually deleted.
 */
export async function removeIfUnreferenced(
  client: SupabaseClient,
  path: string
): Promise<boolean> {
  if (!path) return false;

  if (await isPathReferenced(client, path)) {
    return false;
  }

  const { error } = await client.storage.from(BUCKET).remove([path]);
  if (error) {
    throw new Error(`Could not remove ${path}: ${error.message}`);
  }
  return true;
}

export async function uploadObject(
  client: SupabaseClient,
  path: string,
  file: File
): Promise<{ path: string; publicUrl: string }> {
  const buffer = await file.arrayBuffer();

  const { error } = await client.storage
    .from(BUCKET)
    .upload(path, new Uint8Array(buffer), {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return { path, publicUrl: publicUrlFor(path) };
}

/** Replaces the screenshot row for one role, or removes it when the role is empty. */
export async function setScreenshotRow(
  client: SupabaseClient,
  projectId: string,
  role: ScreenshotGalleryRole,
  imagePath: string | null,
  altText: string
): Promise<void> {
  const viewType = VIEW_TYPE_BY_ROLE[role];
  const sortOrder = SORT_ORDER[role];
  const { data: existing, error: lookupError } = await client
    .from("project_screenshots")
    .select("id")
    .eq("project_id", projectId)
    .eq("view_type", viewType)
    .eq("sort_order", sortOrder)
    .limit(1)
    .maybeSingle();
  if (lookupError) {
    throw new Error(`Could not find the ${role} screenshot row: ${lookupError.message}`);
  }

  if (!imagePath) {
    if (existing) {
      const { error } = await client
        .from("project_screenshots")
        .delete()
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
    }
    return;
  }

  if (existing) {
    const { error } = await client
      .from("project_screenshots")
      .update({
        image_path: imagePath,
        sort_order: sortOrder,
        alt_text: altText,
      })
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await client.from("project_screenshots").insert({
    project_id: projectId,
    image_path: imagePath,
    view_type: viewType,
    sort_order: sortOrder,
    alt_text: altText,
  });
  if (error) throw new Error(error.message);
}

export type ProjectPayload = Partial<Project> & Record<string, unknown>;

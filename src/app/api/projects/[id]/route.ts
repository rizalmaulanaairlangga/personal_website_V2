import { requireAuth } from "@/lib/auth";
import {
  ProjectPayload,
  VIEW_TYPE_BY_ROLE,
  isPathReferenced,
  publicUrlFor,
  setScreenshotRow,
} from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** The four screenshot roles, in the order the form presents them. */
const ROLES = ["hero", "mobile", "tablet", "desktop"] as const;
type Role = (typeof ROLES)[number];

interface ScreenshotPaths {
  hero?: string | null;
  mobile?: string | null;
  tablet?: string | null;
  desktop?: string | null;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const auth = await requireAuth();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const { data: project, error: projectError } = await auth.client
      .from("proyek_web")
      .select("*")
      .eq("id", id)
      .single();

    if (projectError) {
      return NextResponse.json({ error: projectError.message }, { status: 404 });
    }

    const { data: screenshots, error: screenshotsError } = await auth.client
      .from("project_screenshots")
      .select("*")
      .eq("project_id", id)
      .order("sort_order");

    if (screenshotsError) {
      return NextResponse.json({ error: screenshotsError.message }, { status: 500 });
    }

    return NextResponse.json({ project, screenshots: screenshots || [] });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const auth = await requireAuth();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { project: projectInput, screenshots, previous } = (body || {}) as {
      project?: ProjectPayload;
      screenshots?: ScreenshotPaths;
      previous?: ScreenshotPaths;
    };

    if (!projectInput || typeof projectInput !== "object") {
      return NextResponse.json({ error: "Missing project payload" }, { status: 400 });
    }

    const payload: Record<string, unknown> = { ...projectInput };

    // The hero image lives on the project row rather than in a screenshot row.
    const newPaths: ScreenshotPaths = screenshots || {};
    const oldPaths: ScreenshotPaths = previous || {};

    if (newPaths.hero) {
      payload.foto_storage_path = newPaths.hero;
      payload.foto_public_url = publicUrlFor(newPaths.hero);
      payload.foto_file_name = newPaths.hero.split("/").pop() || null;
    } else if (newPaths.hero === null) {
      payload.foto_storage_path = null;
      payload.foto_public_url = null;
      payload.foto_file_name = null;
    }

    const { data: project, error: projectError } = await auth.client
      .from("proyek_web")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (projectError) {
      return NextResponse.json({ error: projectError.message }, { status: 500 });
    }

    // Gallery rows. The public project page reads these.
    for (const role of ["mobile", "tablet", "desktop"] as const) {
      if (!(role in newPaths)) continue;

      const viewType = VIEW_TYPE_BY_ROLE[role];
      const path = newPaths[role] || null;

      try {
        await setScreenshotRow(
          auth.client,
          id,
          viewType,
          path,
          `${project.name} ${viewType} screenshot`
        );
      } catch (err) {
        return NextResponse.json(
          { error: `Could not update the ${role} screenshot: ${(err as Error).message}` },
          { status: 500 }
        );
      }
    }

    // Only now that the new references are stored, release the objects they
    // replaced. A file is removed only when the database no longer points at
    // it, so an unrelated project is never affected.
    const cleaned: string[] = [];
    const skipped: string[] = [];

    for (const role of ROLES) {
      const oldPath = oldPaths[role];
      if (!oldPath) continue;
      if (oldPath === newPaths[role]) continue;

      try {
        if (await isPathReferenced(auth.client, oldPath)) {
          skipped.push(oldPath);
          continue;
        }
        const { error } = await auth.client.storage
          .from("portfolio-proyek")
          .remove([oldPath]);
        if (error) {
          skipped.push(oldPath);
        } else {
          cleaned.push(oldPath);
        }
      } catch {
        skipped.push(oldPath);
      }
    }

    return NextResponse.json({ project, cleaned, skipped });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const auth = await requireAuth();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Collect this project's own objects first so they can be released once
    // the row is gone and nothing else references them.
    const { data: project } = await auth.client
      .from("proyek_web")
      .select("name, foto_storage_path")
      .eq("id", id)
      .single();

    const { data: shots } = await auth.client
      .from("project_screenshots")
      .select("image_path")
      .eq("project_id", id);

    const candidates = [
      project?.foto_storage_path || null,
      ...(shots || []).map((s) => s.image_path),
    ].filter((p): p is string => Boolean(p));

    // The foreign key cascades, so the screenshot rows go with the project.
    const { error: projectError } = await auth.client
      .from("proyek_web")
      .delete()
      .eq("id", id);

    if (projectError) {
      return NextResponse.json({ error: projectError.message }, { status: 500 });
    }

    const removed: string[] = [];
    const kept: string[] = [];

    for (const path of candidates) {
      try {
        if (await isPathReferenced(auth.client, path)) {
          kept.push(path);
          continue;
        }
        const { error } = await auth.client.storage
          .from("portfolio-proyek")
          .remove([path]);
        if (error) kept.push(path);
        else removed.push(path);
      } catch {
        kept.push(path);
      }
    }

    return NextResponse.json({ success: true, removed, kept });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

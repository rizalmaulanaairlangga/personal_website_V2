import { requireAuth } from "@/lib/auth";
import { buildStoragePath, uploadObject, BUCKET, isPathReferenced } from "@/lib/data";
import {
  compressCmsImage,
  InvalidCmsImageError,
  MAX_CMS_IMAGE_BYTES,
  CMS_IMAGE_TYPES,
} from "@/lib/image-processing";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ROLES = new Set(["hero", "mobile", "mobile2", "mobile3", "tablet", "desktop"]);

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const fileValue = formData.get("file");
    const projectName = formData.get("projectName") as string;
    const role = formData.get("role") as string;

    if (!(fileValue instanceof File) || fileValue.size === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    const file = fileValue;
    if (!projectName || !role) {
      return NextResponse.json({ error: "Missing projectName or role" }, { status: 400 });
    }
    if (!ALLOWED_ROLES.has(role)) {
      return NextResponse.json({ error: "Invalid screenshot role" }, { status: 400 });
    }
    if (!CMS_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Use PNG, JPEG, WebP, or GIF." },
        { status: 400 }
      );
    }
    if (file.size > MAX_CMS_IMAGE_BYTES) {
      return NextResponse.json({ error: "File too large. Maximum size is 10 MB." }, { status: 400 });
    }

    // A fresh name every time, so the object the database still points at is
    // never overwritten while the form is being edited.
    const compressed = await compressCmsImage(file);
    const { path, fileName } = buildStoragePath(projectName, role, compressed.fileName);
    const { publicUrl } = await uploadObject(auth.client, path, compressed.bytes, {
      bucket: BUCKET,
      contentType: compressed.mimeType,
    });

    return NextResponse.json({
      path,
      publicUrl,
      fileName,
      bucket: BUCKET,
      size: compressed.size,
      originalSize: compressed.originalSize,
      type: compressed.mimeType,
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Upload failed" },
      { status: err instanceof InvalidCmsImageError ? 400 : 500 }
    );
  }
}

/**
 * Confirms that each path really resolves to an object in the bucket. The form
 * calls this after saving, so a success message never rests on an upload
 * counter alone.
 */
export async function PUT(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { paths } = await request.json();

    if (!Array.isArray(paths) || paths.length === 0) {
      return NextResponse.json({ error: "No paths provided" }, { status: 400 });
    }

    const missing: string[] = [];

    for (const path of paths as string[]) {
      const parts = path.split("/");
      const fileName = parts.pop();
      const folder = parts.join("/");

      const { data, error } = await auth.client.storage
        .from(BUCKET)
        .list(folder, { search: fileName });

      if (error || !data || data.length === 0) {
        missing.push(path);
      }
    }

    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Could not find uploaded file(s) in Storage: ${missing.join(", ")}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ verified: true, count: paths.length });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Removes an uploaded object that was never attached to a record — for
 * example when the user picked a file and then changed their mind before
 * saving. The path must sit inside the given project's own folder.
 */
export async function DELETE(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");
    const projectName = searchParams.get("projectName");

    if (!path) {
      return NextResponse.json({ error: "Missing path parameter" }, { status: 400 });
    }
    if (!projectName) {
      return NextResponse.json({ error: "Missing projectName parameter" }, { status: 400 });
    }

    // Scope the delete to the project's own folder.
    if (!path.startsWith(`${projectName}/`)) {
      return NextResponse.json(
        { error: "Path does not belong to this project" },
        { status: 400 }
      );
    }
    if (await isPathReferenced(auth.client, path)) {
      return NextResponse.json(
        { error: "This object is still referenced by a project and cannot be removed as an unsaved upload." },
        { status: 409 }
      );
    }

    const { error } = await auth.client.storage.from(BUCKET).remove([path]);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

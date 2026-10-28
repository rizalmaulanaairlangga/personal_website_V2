import { requireAuth } from "@/lib/auth";
import {
  CMS_IMAGE_TYPES,
  compressCmsImage,
  InvalidCmsImageError,
  MAX_CMS_IMAGE_BYTES,
} from "@/lib/image-processing";
import {
  fileSlug,
  publicUrlFor,
  TOOLS_BUCKET,
  uploadObject,
} from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAuth();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await auth.client
    .from("tools")
    .select("tool_id,name,short_desc,category,logo_file_name,logo_storage_path,logo_public_url")
    .order("tool_id", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const categories = Array.from(
    new Set<string>(
      (data || [])
        .map((tool) => (typeof tool.category === "string" ? tool.category.trim() : ""))
        .filter(Boolean)
    )
  ).sort((left, right) => left.localeCompare(right));

  return NextResponse.json({ tools: data || [], categories });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const name = String(formData.get("name") || "").trim();
    const shortDescription = String(formData.get("short_desc") || "").trim();
    const category = String(formData.get("category") || "").trim();
    const fileValue = formData.get("file");

    if (!name || !shortDescription || !category) {
      return NextResponse.json(
        { error: "Name, short description, and category are required." },
        { status: 400 }
      );
    }
    if (!(fileValue instanceof File) || fileValue.size === 0) {
      return NextResponse.json({ error: "Choose a tool logo image." }, { status: 400 });
    }
    if (!CMS_IMAGE_TYPES.has(fileValue.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Use PNG, JPEG, WebP, or GIF." },
        { status: 400 }
      );
    }
    if (fileValue.size > MAX_CMS_IMAGE_BYTES) {
      return NextResponse.json({ error: "File too large. Maximum size is 10 MB." }, { status: 400 });
    }

    const compressed = await compressCmsImage(fileValue);
    const safeFolderName = name
      .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "-")
      .replace(/\s+/g, " ")
      .slice(0, 80);
    const fileName = `${fileSlug(name) || "tool"}-${crypto.randomUUID().slice(0, 8)}.webp`;
    const storageKey = `Tools/${safeFolderName}/logo/${fileName}`;
    const storedPath = `${TOOLS_BUCKET}/${storageKey}`;

    const uploaded = await uploadObject(auth.client, storageKey, compressed.bytes, {
      bucket: TOOLS_BUCKET,
      contentType: compressed.mimeType,
    });

    const timestamp = new Date().toISOString();
    const insertTool = () =>
      auth.client
        .from("tools")
        .insert({
          id: crypto.randomUUID(),
          name,
          short_desc: shortDescription,
          category,
          logo_file_name: fileName,
          logo_storage_path: storedPath,
          logo_public_url: uploaded.publicUrl || publicUrlFor(storageKey, TOOLS_BUCKET),
          created_time: timestamp,
          updated_time: timestamp,
        })
        .select("tool_id,name,short_desc,category,logo_file_name,logo_storage_path,logo_public_url")
        .single();

    const cleanupUploadedLogo = async () => {
      try {
        const { error: cleanupError } = await auth.client.storage
          .from(TOOLS_BUCKET)
          .remove([storageKey]);
        return cleanupError?.message;
      } catch (cleanupError) {
        return (cleanupError as Error).message || "Storage cleanup failed.";
      }
    };

    let insertResult: Awaited<ReturnType<typeof insertTool>>;
    try {
      insertResult = await insertTool();
    } catch (insertError) {
      const cleanupError = await cleanupUploadedLogo();
      const detail = cleanupError ? ` Logo cleanup failed: ${cleanupError}` : "";
      return NextResponse.json(
        { error: `${(insertError as Error).message || "Could not save the tool."}${detail}` },
        { status: 500 }
      );
    }

    if (insertResult.error) {
      const cleanupError = await cleanupUploadedLogo();
      const detail = cleanupError ? ` Logo cleanup failed: ${cleanupError}` : "";
      return NextResponse.json(
        { error: `${insertResult.error.message}${detail}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { tool: insertResult.data, size: compressed.size, originalSize: compressed.originalSize },
      { status: 201 }
    );
  } catch (err) {
    const status = err instanceof InvalidCmsImageError ? 400 : 500;
    return NextResponse.json(
      { error: (err as Error).message || "Could not add tool." },
      { status }
    );
  }
}

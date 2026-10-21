import { requireAuth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { slug, excludeId } = await request.json();

    if (!slug) {
      return NextResponse.json({ valid: false, error: "Slug is required" }, { status: 400 });
    }

    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json({
        valid: false,
        error: "Slug must contain only lowercase letters, numbers, and single hyphens",
      }, { status: 400 });
    }

    if (slug.length > 100) {
      return NextResponse.json({
        valid: false,
        error: "Slug is too long (max 100 characters)",
      }, { status: 400 });
    }

    let query = auth.client.from("proyek_web").select("id, name").eq("slug", slug);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (data && data.length > 0) {
      return NextResponse.json(
        {
          valid: false,
          error: `This slug is already used by "${data[0].name}"`,
        },
        { status: 409 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

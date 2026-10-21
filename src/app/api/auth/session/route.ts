import { createServerSupabaseClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return NextResponse.json({ session });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

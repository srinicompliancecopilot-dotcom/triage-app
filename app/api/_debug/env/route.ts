import { NextResponse } from "next/server";
export async function GET() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return NextResponse.json({
    ok: true,
    supabase_url_present: Boolean(url),
    supabase_key_len: key.length   // length only (no secret leakage)
  });
}

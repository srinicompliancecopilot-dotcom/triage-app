import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({
    ok: true,
    supabase_url_present: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabase_key_len: (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").length
  });
}

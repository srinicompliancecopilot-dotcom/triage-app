import { NextResponse } from "next/server";
import { supa } from "../../../../lib/supabase";

export async function GET() {
  const { data, error } = await supa
    .from("cases")
    .insert({ source: "gmail", subject: "debug insert", ext_ref: `dbg-\${Date.now()}` })
    .select()
    .single();
  if (error) return NextResponse.json({ ok:false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok:true, case_id: data.id });
}

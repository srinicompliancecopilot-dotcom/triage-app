import { NextRequest, NextResponse } from "next/server";
import { supa } from "../../../../lib/supabase";
import { computeRules } from "../../../../lib/rules";

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();

    // idempotency by external_id (e.g., Gmail message id)
    if (b.external_id) {
      const { data: existing, error: checkErr } = await supa
        .from("cases")
        .select("id")
        .eq("ext_ref", b.external_id)
        .limit(1);
      if (checkErr) throw checkErr;
      if (existing && existing.length) {
        return NextResponse.json({ ok: true, skipped: "duplicate" });
      }
    }
    // compute risk & SLA
    const { risk, sla_due } = computeRules({ subject: b.subject });

    // create case
    const { data: caseRow, error: caseErr } = await supa
      .from("cases")
      .insert({
        source: "gmail",
        subject: b.subject ?? "",
        ext_ref: b.external_id ?? null,
        status: "new",
        risk,
        sla_due
      })
      .select()
      .single();
    if (caseErr) throw caseErr;

    // first message
    const receivedAt = b.received_at
      ? new Date(b.received_at).toISOString()
      : new Date().toISOString();

    const { error: msgErr } = await supa.from("messages").insert({
      case_id: caseRow.id,
      from_addr: b.from ?? "",
      to_addr: b.to ?? "",
      cc: b.cc ?? "",
      body_html: b.body_html ?? null,
      body_text: b.body_text ?? null,
      received_at: receivedAt,
      is_draft: false
    });
    if (msgErr) throw msgErr;
    return NextResponse.json({ ok: true, case_id: caseRow.id });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 400 });
  }
}

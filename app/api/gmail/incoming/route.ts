import { NextRequest, NextResponse } from "next/server";
import { supa } from "../../../../lib/supabase";
import { computeRules } from "../../../../lib/rules";
import { pickOwnerRole } from "../../../../lib/assign";

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();

    // --- Idempotency: check if we've seen this Gmail message before
    if (b.external_id) {
      const { data: existing, error: checkErr } = await supa
        .from("cases")
        .select("id")
        .eq("source_msg_id", b.external_id) // <-- use source_msg_id (cases)
        .limit(1);
      if (checkErr) throw checkErr;
      if (existing && existing.length) {
        return NextResponse.json({ ok: true, skipped: "duplicate" });
      }
    }

    // --- Risk & SLA
    const { risk, sla_due } = computeRules({
      subject: b.subject ?? "",
      body_text: b.body_text ?? ""
    });



    // --- Owner assignment
    const owner_role = pickOwnerRole({
      risk,
      subject: b.subject,
      body_text: b.body_text
    });

    // --- Acknowledge target (e.g., 2h)
    const ack_due = new Date(Date.now() + 2 * 60 * 60 * 1000);

    // --- Create case (owner/status/ack_due/source_msg_id live here)
    const { data: caseRow, error: caseErr } = await supa
      .from("cases")
      .insert({
        source: "gmail",
        subject: b.subject ?? "",
        risk,
        sla_due,
        owner_role,
        status: "Open",
        ack_due,
        source_msg_id: b.external_id ?? null // <-- idempotency key
      })
      .select()
      .single();
    if (caseErr) throw caseErr;

    // --- First message (messages has external_id, not owner/status/ack_due)
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
      is_draft: false,
      external_id: b.external_id ?? null
    });
    if (msgErr) throw msgErr;

    return NextResponse.json({ ok: true, case_id: caseRow.id });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 400 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { graphGet } from "../../../../lib/graph";
import { supa } from "../../../lib/supabase";

const MAILBOX = process.env.GRAPH_MAILBOX_ID!; // email or user id of the shared inbox

export async function GET(req: NextRequest) {
  // Graph validation ping: echo back ?validationToken=
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("validationToken");
  if (token) {
    return new NextResponse(token, { status: 200, headers: { "Content-Type": "text/plain" } });
  }
  return NextResponse.json({ ok: true });
}

async function persistEmailById(messageId: string) {
  // fetch the full message and store it
  const msg = await graphGet(`/users/${encodeURIComponent(MAILBOX)}/messages/${messageId}`);
  const subject = msg.subject ?? "";
  const bodyHtml = msg.body?.content ?? "";
  const fromAddr = msg.from?.emailAddress?.address ?? "";
  const receivedAt = msg.receivedDateTime;

  // create case
  const { data: caseRow, error: caseErr } = await supa
    .from("cases")
    .insert({ source: "outlook", subject, ext_ref: msg.id })
    .select()
    .single();
  if (caseErr) throw caseErr;

  // first message
  await supa.from("messages").insert({
    case_id: caseRow.id,
    from_addr: fromAddr,
    to_addr: (msg.toRecipients ?? []).map((r:any)=>r.emailAddress.address).join(","),
    cc: (msg.ccRecipients ?? []).map((r:any)=>r.emailAddress.address).join(","),
    body_html: bodyHtml,
    received_at: receivedAt
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.value) return NextResponse.json({ ok: true });

  for (const n of body.value as any[]) {
    // resource e.g. /users('id')/messages('msgId')
    const m = /messages\('([^']+)'\)/.exec(n.resource || "");
    const id = m?.[1];
    if (id) {
      try { await persistEmailById(id); } catch { /* TODO: log */ }
    }
  }
  return NextResponse.json({ received: (body.value as any[]).length });
}

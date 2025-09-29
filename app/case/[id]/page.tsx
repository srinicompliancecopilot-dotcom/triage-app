import { supa } from "../../lib/supabase";

type CaseRow = {
  id: string;
  subject: string | null;
  risk: "high" | "medium" | "low" | null;
  owner_role: string | null;
  status: string | null;
  ack_due: string | null;
  sla_due: string | null;
  created_at: string;
};

type MsgRow = {
  created_at: string;
  from_addr: string | null;
  to_addr: string | null;
  cc: string | null;
  body_text: string | null;
  body_html: string | null;
  is_draft: boolean | null;
  external_id: string | null;
};

const fmt = (iso?: string | null) => (iso ? new Date(iso).toLocaleString() : "");

export default async function CasePage({ params }: { params: { id: string } }) {
  const id = params.id;

  const { data: c } = await supa
    .from("cases")
    .select("*")
    .eq("id", id)
    .single();

  const { data: msgs } = await supa
    .from("messages")
    .select("created_at, from_addr, to_addr, cc, body_text, body_html, is_draft, external_id")
    .eq("case_id", id)
    .order("created_at", { ascending: true });

  if (!c) {
    return <main style={{ padding: 24, fontFamily: "system-ui, Arial" }}>Not found</main>;
  }

  const overdue = c.sla_due ? new Date(c.sla_due).getTime() < Date.now() : false;

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, Arial", maxWidth: 900, margin: "0 auto" }}>
      <a href="/" style={{ fontSize: 12, textDecoration: "none" }}>← Back</a>
      <h1 style={{ margin: "6px 0 8px" }}>{c.subject || "(no subject)"}</h1>

      {/* chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, fontSize: 12, marginBottom: 12 }}>
        <span style={{
          padding: "2px 8px", borderRadius: 999, border: "1px solid #ddd",
          background: c.risk === "high" ? "#ffe5e5" : c.risk === "medium" ? "#fff4e5" : "#eaf7ff",
          textTransform: "capitalize"
        }}>
          {c.risk || "low"}
        </span>
        {c.owner_role && (
          <span style={{ padding: "2px 8px", borderRadius: 999, border: "1px solid #ddd" }}>
            {c.owner_role}
          </span>
        )}
        <span style={{ padding: "2px 8px", borderRadius: 999, border: "1px solid #ddd", textTransform: "capitalize" }}>
          {c.status || "Open"}
        </span>
        {c.ack_due && (
          <span style={{ padding: "2px 8px", borderRadius: 999, border: "1px solid #ddd" }}>
            Ack due: {fmt(c.ack_due)}
          </span>
        )}
        {c.sla_due && (
          <span style={{ padding: "2px 8px", borderRadius: 999, border: "1px solid #ddd" }}>
            SLA: {fmt(c.sla_due)}{overdue ? " • overdue" : ""}
          </span>
        )}
        <span style={{ opacity: 0.6 }}>• Created {fmt(c.created_at)}</span>
      </div>

      {/* timeline */}
      <div style={{ display: "grid", gap: 12 }}>
        {(msgs ?? []).map((m: MsgRow, i: number) => (
          <div key={i} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>
              {fmt(m.created_at)} · from {m.from_addr || "unknown"} → {m.to_addr || "unknown"}
              {m.cc ? ` · cc ${m.cc}` : ""}
              {m.is_draft ? " · draft" : ""}
            </div>
            {m.body_html ? (
              <div dangerouslySetInnerHTML={{ __html: m.body_html }} />
            ) : (
              <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{m.body_text || ""}</pre>
            )}
          </div>
        ))}

        {!msgs?.length && (
          <div style={{ border: "1px dashed #ddd", borderRadius: 8, padding: 12, fontSize: 14, opacity: 0.8 }}>
            No messages yet.
          </div>
        )}
      </div>
    </main>
  );
}

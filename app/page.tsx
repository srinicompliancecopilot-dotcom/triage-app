import { supa } from "../lib/supabase";
export const revalidate = 0;

export default async function Home() {
  const { data: rows } = await supa
    .from("cases")
    .select("id, subject, risk, sla_due, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, Arial" }}>
      <h1 style={{ marginBottom: 12 }}>Inbox</h1>
      {!rows?.length ? (
        <p>No cases yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {rows!.map((r) => (
            <li key={r.id} style={{
              border: "1px solid #ddd", borderRadius: 8, padding: 12, marginBottom: 10
            }}>
              <div style={{ fontWeight: 700 }}>{r.subject || "(no subject)"}</div>
              <div style={{ marginTop: 6, display: "flex", gap: 10, fontSize: 12 }}>
                <span style={{
                  padding: "2px 8px", borderRadius: 999,
                  background: r.risk === "high" ? "#ffe5e5"
                           : r.risk === "medium" ? "#fff4e5" : "#eaf7ff",
                  border: "1px solid #ddd"
                }}>
                  {r.risk || "low"}
                </span>
                {r.sla_due && (
                  <span style={{ padding: "2px 8px", borderRadius: 999, border: "1px solid #ddd" }}>
                    SLA: {new Date(r.sla_due).toLocaleString()}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

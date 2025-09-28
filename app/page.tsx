import { supa } from "../lib/supabase";
export const revalidate = 0;

type CaseRow = {
  id: string;
  subject: string | null;
  risk: "high" | "medium" | "low" | null;
  sla_due: string | null;
  owner_role: string | null;
  status: string | null;
  created_at: string;
};

export default async function Home() {
  const { data: rows } = await supa
    .from("cases")
    .select("id, subject, risk, sla_due, owner_role, status, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  const fmt = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleString() : "";

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, Arial" }}>
      <h1 style={{ marginBottom: 12 }}>Inbox</h1>
      {!rows?.length ? (
        <p>No cases yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {(rows as CaseRow[]).map((r) => {
            const overdue =
              r.sla_due ? new Date(r.sla_due).getTime() < Date.now() : false;

            return (
              <li
                key={r.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 10,
                  background: overdue ? "#fff5f5" : "white",
                }}
              >
                <a
                  href={`/case/${r.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div style={{ fontWeight: 700 }}>
                    {r.subject || "(no subject)"}
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 10,
                      fontSize: 12,
                      alignItems: "center",
                    }}
                  >
                    {/* Risk chip */}
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 999,
                        background:
                          r.risk === "high"
                            ? "#ffe5e5"
                            : r.risk === "medium"
                            ? "#fff4e5"
                            : "#eaf7ff",
                        border: "1px solid #ddd",
                        textTransform: "capitalize",
                      }}
                    >
                      {r.risk || "low"}
                    </span>

                    {/* SLA chip */}
                    {r.sla_due && (
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 999,
                          border: "1px solid #ddd",
                        }}
                      >
                        SLA: {fmt(r.sla_due)}
                        {overdue ? " • overdue" : ""}
                      </span>
                    )}

                    {/* Owner chip */}
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 999,
                        border: "1px solid #ddd",
                      }}
                    >
                      {r.owner_role || "Unassigned"}
                    </span>

                    {/* Status chip */}
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 999,
                        border: "1px solid #ddd",
                        textTransform: "capitalize",
                      }}
                    >
                      {r.status || "Open"}
                    </span>

                    {/* Created at (muted) */}
                    <span style={{ opacity: 0.6 }}>
                      • {fmt(r.created_at)}
                    </span>
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

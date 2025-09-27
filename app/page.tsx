import { supa } from "../lib/supabase";

export default async function Home() {
  const { data: rows } = await supa
    .from("cases")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <main style={{ padding: 24 }}>
      <h1>Inbox</h1>
      {(!rows || rows.length === 0) && <p>No cases yet.</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {rows?.map((r:any)=>(
          <li key={r.id} style={{ border: "1px solid #ddd", margin: "8px 0", padding: 12 }}>
            <div style={{ fontSize: 12, opacity: .7 }}>{r.source}</div>
            <div><strong>{r.subject || "(no subject)"}</strong></div>
            <div style={{ fontSize: 12 }}>{new Date(r.created_at).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}

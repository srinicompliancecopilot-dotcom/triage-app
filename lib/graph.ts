import qs from "querystring";

const tenant = process.env.GRAPH_TENANT_ID!;
const clientId = process.env.GRAPH_CLIENT_ID!;
const clientSecret = process.env.GRAPH_CLIENT_SECRET!;

async function getAppToken() {
  const res = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: qs.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials"
    })
  });
  if (!res.ok) throw new Error("Token fetch failed");
  return res.json() as Promise<{ access_token: string }>;
}

export async function graphGet(path: string) {
  const { access_token } = await getAppToken();
  const res = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    headers: { Authorization: `Bearer ${access_token}` }
  });
  if (!res.ok) throw new Error(`Graph GET failed: ${await res.text()}`);
  return res.json();
}

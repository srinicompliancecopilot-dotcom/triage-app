export type Rules = {
  risk: "high" | "medium" | "low";
  sla_due: string; // ISO
};

export function computeRules(input: { subject?: string }) : Rules {
  const s = (input.subject || "").toLowerCase();
  const high   = /(urgent|breach|security|outage|payment failed)/.test(s);
  const medium = /(error|failed|complaint|delay|escalat)/.test(s);
  const risk: Rules["risk"] = high ? "high" : medium ? "medium" : "low";
  const hours = risk === "high" ? 4 : risk === "medium" ? 24 : 72;
  return { risk, sla_due: new Date(Date.now() + hours * 3600_000).toISOString() };
}

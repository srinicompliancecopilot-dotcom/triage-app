// lib/rules.ts
export type Rules = {
  risk: "high" | "medium" | "low";
  sla_due: string; // ISO
};
export type RulesInput = { subject?: string; body_text?: string };

export function computeRules(input: RulesInput): Rules {
  const s = `${input.subject ?? ""} ${input.body_text ?? ""}`.toLowerCase();

  const high =
    /(urgent|sirs|reportable|abuse|assault|fall with injury|fracture|000|ambulance|breach|security|outage|payment failed)/.test(
      s
    );
  const medium = /(error|failed|complaint|delay|escalat|medication|dose)/.test(s);

  const risk: Rules["risk"] = high ? "high" : medium ? "medium" : "low";
  const hours = risk === "high" ? 4 : risk === "medium" ? 24 : 72;

  return { risk, sla_due: new Date(Date.now() + hours * 3600_000).toISOString() };
}

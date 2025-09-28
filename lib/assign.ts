export type AssignInput = {
  risk?: 'high'|'medium'|'low';
  subject?: string | null;
  body_text?: string | null;
};

export function pickOwnerRole(i: AssignInput): string {
  const s = `${i.subject ?? ''} ${i.body_text ?? ''}`.toLowerCase();

  if (i.risk === 'high') return 'On-Call';
  if (/\b(fall|injur|fracture|hospital|000|ambulance)\b/.test(s)) return 'Nurse Unit Manager';
  if (/\b(medication|dose|mar|pharmacy|script)\b/.test(s)) return 'Clinical Lead';
  if (/\b(food|meal|kitchen|diet|nutrition)\b/.test(s)) return 'Catering Manager';
  if (/\b(staff|conduct|attitude|rude|behav)\b/.test(s)) return 'People & Culture';
  return 'Quality & Risk';
}

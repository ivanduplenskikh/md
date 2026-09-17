export const ALERT_TYPES = ["note", "tip", "important", "warning", "caution"] as const;

export const ALERT_MARKER = new RegExp(`^\\[!(${ALERT_TYPES.join("|")})\\][ \\t]*\\n?`, "i");

export function alertTitle(kind: string) {
  return kind[0].toUpperCase() + kind.slice(1).toLowerCase();
}

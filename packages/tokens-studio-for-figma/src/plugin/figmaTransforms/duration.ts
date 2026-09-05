// Normalize a duration token value to a number of milliseconds.
// Accepts "200ms", "0.2s", "200", 200, or the DTCG object { value, unit }.
// Returns NaN if the value can't be parsed.
export function convertDurationToMs(value: unknown): number {
  if (value == null) return NaN;
  if (typeof value === 'number') return value;
  if (typeof value === 'object') {
    const obj = value as { value?: unknown; unit?: unknown };
    const num = Number(obj.value);
    if (!Number.isFinite(num)) return NaN;
    return obj.unit === 's' ? num * 1000 : num;
  }
  const str = String(value).trim();
  const match = str.match(/^(-?\d*\.?\d+)\s*(ms|s)?$/i);
  if (!match) return Number(str);
  const num = parseFloat(match[1]);
  return match[2]?.toLowerCase() === 's' ? num * 1000 : num;
}

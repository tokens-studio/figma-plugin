// Normalize a duration token value to a number of milliseconds.
// Accepts "200ms", "0.2s", "200", 200, or the DTCG object { value, unit }.
// Returns NaN if the value can't be parsed (including empty/whitespace strings
// and empty-value objects — Number("") is 0 but that would silently pass as a
// zero-duration variable, so reject explicitly).
export function convertDurationToMs(value: unknown): number {
  if (value == null) return NaN;
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
  if (typeof value === 'object') {
    const obj = value as { value?: unknown; unit?: unknown };
    if (obj.value === '' || obj.value == null) return NaN;
    const num = Number(obj.value);
    if (!Number.isFinite(num)) return NaN;
    const unit = typeof obj.unit === 'string' ? obj.unit.toLowerCase() : 'ms';
    return unit === 's' ? num * 1000 : num;
  }
  const str = String(value).trim();
  if (!str) return NaN;
  const match = str.match(/^(-?\d*\.?\d+)\s*(ms|s)?$/i);
  if (!match) {
    const parsed = Number(str);
    return Number.isFinite(parsed) ? parsed : NaN;
  }
  const num = parseFloat(match[1]);
  return match[2]?.toLowerCase() === 's' ? num * 1000 : num;
}

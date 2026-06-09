import { tryParseJson } from '@/utils/tryParseJson';
import { dtcgUnitToCssUnit } from './dtcgUnitToCssUnit';

// Resolved typography values can arrive in formats the raw-apply path can't consume:
//  - DTCG dimension objects like { value: 24, unit: 'px' } (from variable/local resolution)
//  - JSON-array font families like '["Comic","Sans","MS"]' (from server resolution)
// transformValue/setFontStyleOnTarget expect plain strings (e.g. '24px', 'Comic, Sans, MS'),
// so we normalize here. parseFloat on a raw object yields NaN, which throws when assigned.
export function normalizeTypographyPropertyValue(key: string, raw: any): any {
  if (raw && typeof raw === 'object' && !Array.isArray(raw) && 'value' in raw) {
    return `${raw.value}${dtcgUnitToCssUnit(raw.unit)}`;
  }
  if ((key === 'fontFamily' || key === 'fontFamilies') && typeof raw === 'string' && raw.trim().startsWith('[')) {
    const parsed = tryParseJson<unknown[]>(raw);
    if (Array.isArray(parsed)) return parsed.map((f) => String(f)).join(', ');
  }
  return raw;
}

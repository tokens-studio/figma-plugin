export function dtcgUnitToCssUnit(unit: unknown): string {
  if (unit === 'PIXELS') return 'px';
  if (unit === 'PERCENT') return '%';
  return typeof unit === 'string' ? unit : '';
}

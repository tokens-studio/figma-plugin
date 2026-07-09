import { TokenGradientValue } from '@/types/values';

// Ported from Studio's gradientPreview.ts so gradient tokens render the same
// in the plugin as they do in the Studio app.

function sortedCssStops(value: TokenGradientValue): string {
  const stops = Array.isArray(value.stops) ? [...value.stops] : [];
  return stops
    .sort((a, b) => a.position - b.position)
    .map((stop) => `${stop.color} ${stop.position * 100}%`)
    .join(', ');
}

// Builds a CSS gradient string from a gradient token value. Stop colors are
// used as-is, so pass a resolved value when stops contain token references.
// Diamond gradients have no CSS equivalent and fall back to a linear preview.
export function gradientTokenToCss(value: TokenGradientValue): string {
  if (!Array.isArray(value.stops) || value.stops.length === 0) return 'transparent';
  const cssStops = sortedCssStops(value);

  switch (value.kind) {
    case 'linear':
      return `linear-gradient(${value.angle ?? 180}deg, ${cssStops})`;
    case 'radial':
      return `radial-gradient(${value.shape ?? 'circle'}, ${cssStops})`;
    case 'conic':
      return `conic-gradient(from ${value.startAngle ?? 0}deg, ${cssStops})`;
    default:
      return `linear-gradient(45deg, ${cssStops})`;
  }
}

// Human-readable summary, e.g. "linear, 180°, 2 stops".
export function gradientTokenSummary(value: TokenGradientValue): string {
  const kind = value.kind ?? 'linear';
  const count = Array.isArray(value.stops) ? value.stops.length : 0;
  const parts = [kind];
  if (value.angle != null) parts.push(`${value.angle}°`);
  parts.push(`${count} stop${count !== 1 ? 's' : ''}`);
  return parts.join(', ');
}

export function isGradientTokenValue(value: unknown): value is TokenGradientValue {
  return (
    typeof value === 'object'
    && value !== null
    && !Array.isArray(value)
    && 'stops' in value
    && Array.isArray((value as TokenGradientValue).stops)
  );
}

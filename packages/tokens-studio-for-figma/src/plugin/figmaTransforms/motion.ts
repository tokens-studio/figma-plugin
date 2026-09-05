// DTCG motion token values -> the shapes Figma's `Variable.setValueForMode`
// expects for the TIMING and EASING variable types.
//
//   TIMING: a bare seconds number (0.2)
//   EASING: `MotionEasing`, e.g.
//     { type: "CUSTOM_CUBIC_BEZIER",
//       easingFunctionCubicBezier: { x1, y1, x2, y2 } }
//
// Ported verbatim from studio-on-rails/consumer-plugins/packages/create-variables.

const roundTo6 = (n: number) => Math.round(n * 1000000) / 1000000;

// "200ms" | "0.2s" | 0.2 | { value, unit } -> seconds number.
// Returns null on malformed input.
export function timingToSeconds(value: unknown): number | null {
  if (typeof value === 'number') return roundTo6(value);
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const obj = value as { value?: unknown; unit?: unknown };
    const n = Number(obj.value);
    if (!Number.isFinite(n)) return null;
    return roundTo6(obj.unit === 's' ? n : n / 1000);
  }
  if (typeof value !== 'string') return null;
  const match = value.trim().match(/^([+-]?\d*\.?\d+)\s*(ms|s)?$/);
  if (!match) return null;
  const n = parseFloat(match[1]);
  return roundTo6(match[2] === 's' ? n : n / 1000);
}

const isNumber = (v: unknown): v is number => typeof v === 'number' && !Number.isNaN(v);

// [x1,y1,x2,y2] | "0.4, 0, 0.2, 1" | "cubic-bezier(...)" | MotionEasing -> MotionEasing.
export function toFigmaEasing(value: unknown): MotionEasing | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const rec = value as Record<string, unknown>;
    if (typeof rec.type === 'string') {
      const easing = value as MotionEasing;
      const bezier = easing.easingFunctionCubicBezier;
      const spring = easing.easingFunctionSpring;
      return {
        type: easing.type,
        ...(bezier ? {
          easingFunctionCubicBezier: {
            x1: roundTo6(bezier.x1),
            y1: roundTo6(bezier.y1),
            x2: roundTo6(bezier.x2),
            y2: roundTo6(bezier.y2),
          },
        } : {}),
        ...(spring ? { easingFunctionSpring: { bounce: roundTo6(spring.bounce) } } : {}),
      };
    }
    return null;
  }

  let pts: number[] | null = null;
  if (Array.isArray(value)) {
    pts = value.map(Number);
  } else if (typeof value === 'string') {
    const match = value.match(/cubic-bezier\(([^)]+)\)/i);
    const raw = match ? match[1] : value;
    pts = raw.split(',').map((p) => Number(p.trim()));
  }
  if (!pts || pts.length !== 4 || !pts.every(isNumber)) return null;
  return {
    type: 'CUSTOM_CUBIC_BEZIER',
    easingFunctionCubicBezier: {
      x1: roundTo6(pts[0]),
      y1: roundTo6(pts[1]),
      x2: roundTo6(pts[2]),
      y2: roundTo6(pts[3]),
    },
  };
}

// Figma requires a value in every mode; use linear as a safe default.
export function defaultFigmaEasing(): MotionEasing {
  return {
    type: 'CUSTOM_CUBIC_BEZIER',
    easingFunctionCubicBezier: {
      x1: 0, y1: 0, x2: 1, y2: 1,
    },
  };
}

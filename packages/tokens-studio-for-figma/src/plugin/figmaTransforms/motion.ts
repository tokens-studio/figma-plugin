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
  // A bare number carries no unit; DTCG defaults to ms and the FLOAT
  // fallback path treats it the same, so scale to seconds for consistency.
  if (typeof value === 'number') return Number.isFinite(value) ? roundTo6(value / 1000) : null;
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const obj = value as { value?: unknown; unit?: unknown };
    const n = Number(obj.value);
    if (!Number.isFinite(n)) return null;
    const unit = typeof obj.unit === 'string' ? obj.unit.toLowerCase() : 'ms';
    return roundTo6(unit === 's' ? n : n / 1000);
  }
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^([+-]?\d*\.?\d+)\s*(ms|s)?$/i);
  if (!match) return null;
  const n = parseFloat(match[1]);
  const unit = match[2]?.toLowerCase();
  return roundTo6(unit === 's' ? n : n / 1000);
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
    // Accept "0.4,0.2,0.1,1", "cubic-bezier(...)", and the JSON-stringified
    // array form "[0.4,0.2,0.1,1]" that tokens whose $value was an array
    // get serialized as somewhere upstream.
    const cbMatch = value.match(/cubic-bezier\(([^)]+)\)/i);
    let raw = cbMatch ? cbMatch[1] : value;
    raw = raw.trim();
    if (raw.startsWith('[') && raw.endsWith(']')) raw = raw.slice(1, -1);
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

// Import direction: Figma TIMING seconds -> duration token value ("200ms").
// Figma stores float32, so 0.3s reads back as 0.30000001…; round to µs.
export function secondsToDurationValue(seconds: number): string | null {
  if (!Number.isFinite(seconds)) return null;
  return `${Number((seconds * 1000).toFixed(3))}ms`;
}

// Cubic-bezier equivalents of Figma's preset easings, so a preset EASING
// variable still imports as a cubicBezier token. Spring and HOLD easings
// have no cubic-bezier form.
const PRESET_EASING_BEZIERS: Partial<Record<MotionEasing['type'], [number, number, number, number]>> = {
  LINEAR: [0, 0, 1, 1],
  EASE_IN: [0.42, 0, 1, 1],
  EASE_OUT: [0, 0, 0.58, 1],
  EASE_IN_AND_OUT: [0.42, 0, 0.58, 1],
  EASE_IN_BACK: [0.3, -0.05, 0.7, -0.5],
  EASE_OUT_BACK: [0.45, 1.45, 0.8, 1],
  EASE_IN_AND_OUT_BACK: [0.7, -0.4, 0.4, 1.4],
};

// Import direction: Figma MotionEasing -> cubicBezier token value ("x1, y1, x2, y2"),
// the same canonical string the STRING export fallback writes.
// Returns null for easings that can't be expressed as a cubic bezier.
export function fromFigmaEasing(easing: unknown): string | null {
  if (!easing || typeof easing !== 'object') return null;
  const { type, easingFunctionCubicBezier: bezier } = easing as MotionEasing;
  let pts: number[] | undefined;
  if (bezier && [bezier.x1, bezier.y1, bezier.x2, bezier.y2].every(isNumber)) {
    pts = [bezier.x1, bezier.y1, bezier.x2, bezier.y2];
  } else if (type) {
    pts = PRESET_EASING_BEZIERS[type];
  }
  if (!pts) return null;
  return pts.map(roundTo6).join(', ');
}

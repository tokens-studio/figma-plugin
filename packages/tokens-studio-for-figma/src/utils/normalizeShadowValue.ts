import { BoxShadowTypes } from '@/constants/BoxShadowTypes';

type DtcgShadowFields = {
  offsetX?: string | number;
  offsetY?: string | number;
  inset?: boolean;
};

function normalizeSingleShadow<T>(shadow: T): T {
  if (!shadow || typeof shadow !== 'object' || Array.isArray(shadow)) return shadow;

  const {
    offsetX, offsetY, inset, ...rest
  } = shadow as T & DtcgShadowFields & Record<string, unknown>;
  if (offsetX === undefined && offsetY === undefined && inset === undefined) return shadow;

  const normalized: Record<string, unknown> = { ...rest };
  if (normalized.x === undefined && offsetX !== undefined) normalized.x = offsetX;
  if (normalized.y === undefined && offsetY !== undefined) normalized.y = offsetY;
  // inset is optional in DTCG and defaults to false, so an untyped DTCG shadow is a drop shadow
  if (normalized.type === undefined && (typeof inset === 'boolean' || inset === undefined)) {
    normalized.type = inset ? BoxShadowTypes.INNER_SHADOW : BoxShadowTypes.DROP_SHADOW;
  }
  return normalized as T;
}

// Shadow tokens in the DTCG format use offsetX/offsetY and an inset boolean,
// while the plugin works with x/y and a dropShadow/innerShadow type. This maps
// the DTCG keys onto ours and leaves everything else untouched, including
// string references and values that already use x/y.
export function normalizeShadowValue<T>(value: T): T {
  if (Array.isArray(value)) return value.map((shadow) => normalizeSingleShadow(shadow)) as unknown as T;
  return normalizeSingleShadow(value);
}

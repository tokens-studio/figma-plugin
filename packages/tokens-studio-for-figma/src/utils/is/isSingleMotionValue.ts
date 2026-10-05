import type { TokenMotionValue } from '@/types/values';

export function isSingleMotionValue(value: unknown): value is TokenMotionValue {
  return Boolean(
    value
    && typeof value === 'object'
    && !Array.isArray(value)
    && ('duration' in (value as Record<string, unknown>) || 'timingFunction' in (value as Record<string, unknown>)),
  );
}

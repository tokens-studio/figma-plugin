import type { MapValuesToTokensResult } from '@/types';
import type { SingleBorderToken } from '@/types/tokens';
import type { TokenBorderValue } from '@/types/values';

export function isSingleBorderValue(value: MapValuesToTokensResult[string]): value is SingleBorderToken['value'] {
  return Boolean(
    value
    && (
      typeof value === 'string'
      || ((Array.isArray(value) ? value : [value]) as (
        (TokenBorderValue | Extract<MapValuesToTokensResult[string], { property: string }[]>[number])[]
      )).every((v) => (
        v && typeof v === 'object'
        && (
          'color' in v
          || 'width' in v
          || 'style' in v
        )
      ))
    ),
  );
}

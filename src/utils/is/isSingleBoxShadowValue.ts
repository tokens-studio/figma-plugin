import { BoxShadowTypes } from '@/constants/BoxShadowTypes';
import type { MapValuesToTokensResult } from '@/types';
import type { SingleBoxShadowToken } from '@/types/tokens';
import type { TokenBoxshadowValue } from '@/types/values';

export function isSingleBoxShadowValue(value: MapValuesToTokensResult[string]): value is SingleBoxShadowToken['value'] {
  return Boolean(
    value
    && (
      typeof value === 'string'
      || ((Array.isArray(value) ? value : [value]) as (
        (TokenBoxshadowValue | Extract<MapValuesToTokensResult[string], { property: string }[]>[number])[]
      )).every((v) => (
        v && typeof v === 'object'
        && ('type' in v && 'color' in v)
        && (
          v.type === BoxShadowTypes.DROP_SHADOW
          || v.type === BoxShadowTypes.INNER_SHADOW
        )
      ))
    ),
  );
}

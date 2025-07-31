import type { MapValuesToTokensResult } from '@/types';
import type { SingleTypographyToken } from '@/types/tokens';
import type { TokenTypographyValue } from '@/types/values';

export function isSingleTypographyValue(value: MapValuesToTokensResult[string]): value is SingleTypographyToken['value'] {
  return Boolean(
    value
    && (
      typeof value === 'string'
      || ((Array.isArray(value) ? value : [value]) as (
        (TokenTypographyValue | Extract<MapValuesToTokensResult[string], { property: string }[]>[number])[]
      )).every((v) => (
        v && typeof v === 'object'
        && (
          'fontFamily' in v
          || 'fontWeight' in v
          || 'fontSize' in v
          || 'lineHeight' in v
          || 'letterSpacing' in v
          || 'paragraphSpacing' in v
          || 'paragraphIndent' in v
          || 'textCase' in v
          || 'textDecoration' in v
        )
      ))
    ),
  );
}

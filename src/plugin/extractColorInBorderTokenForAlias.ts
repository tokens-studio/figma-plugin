import { MapValuesToTokensResult } from '@/types';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { AnyTokenList } from '@/types/tokens';

export function extractColorInBorderTokenForAlias(tokens: Map<string, AnyTokenList[number]>, values: NodeTokenRefMap, borderToken: string): MapValuesToTokensResult {
  const resolvedToken = tokens.get(borderToken);
  if (resolvedToken?.rawValue && typeof resolvedToken.rawValue === 'object' && 'color' in resolvedToken.rawValue && resolvedToken.rawValue.color) {
    const { color } = resolvedToken.rawValue;
    const { borderColor } = values;
    let colorTokenName = color;
    if (String(color).startsWith('$')) colorTokenName = String(color).slice(1, String(color).length);
    if (String(color).startsWith('{')) colorTokenName = String(color).slice(1, String(color).length - 1);
    values = { ...values, ...(borderColor ? { } : { borderColor: String(colorTokenName) }) };
  }
  return values;
}

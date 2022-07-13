import { SingleToken } from '@/types/tokens';

export function isTypographyTokenValue(value: SingleToken['value']) {
  if (typeof value !== 'object') return false;
  return 'fontFamily' in value || 'fontWeight' in value || 'lineHeight' in value || 'fontSize' in value
  || 'letterSpacing' in value || 'paragraphSpacing' in value || 'textDecoration' in value || 'textCase' in value;
}

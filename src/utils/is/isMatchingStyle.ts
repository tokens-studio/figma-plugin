import { DeleteTokenPayload } from '@/types/payloads';

export function isMatchingStyle(style: PaintStyle | TextStyle | EffectStyle, token: DeleteTokenPayload) {
  const normalizedPath = style.name.split('/').join('.');
  if (token.path.includes('.')) {
    return token.path === normalizedPath || token.path === normalizedPath.substring(normalizedPath.indexOf('.') + 1) || token.path.substring(token.path.indexOf('.') + 1) === normalizedPath;
  }
  return token.path === normalizedPath || token.path === normalizedPath.substring(normalizedPath.indexOf('.') + 1) || normalizedPath === '';
}

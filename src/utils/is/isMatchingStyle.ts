import { SingleToken } from '@/types/tokens';

export function isMatchingStyle(style: PaintStyle | TextStyle | EffectStyle, token: SingleToken) {
  const normalizedPath = style.name.split('/').join('.');

  return token.name === normalizedPath || token.name === normalizedPath.substring(normalizedPath.indexOf('.') + 1) || token.name.substring(token.name.indexOf('.') + 1) === normalizedPath;
}

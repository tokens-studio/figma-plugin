import { DeleteTokenPayload } from '@/types/payloads';

export function isMatchingStyle(style: PaintStyle | TextStyle | EffectStyle, token: DeleteTokenPayload) {
  return token.path === style.name || token.path === style.name.substring(style.name.indexOf('.') + 1) || token.path.substring(token.path.indexOf('.') + 1) === style.name;
}

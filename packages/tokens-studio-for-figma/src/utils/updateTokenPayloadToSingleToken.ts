import omit from 'just-omit';
import { UpdateTokenPayload } from '@/types/payloads';
import { SingleToken } from '@/types/tokens';
import validateStudioTokensExtensions from './validateStudioTokensExtensions';

export function updateTokenPayloadToSingleToken(
  payload: UpdateTokenPayload,
  id?: string,
): SingleToken {
  const studioTokensExtension = {
    ...(id ? { id } : {}),
    ...validateStudioTokensExtensions(payload),
  };
  // Leave out empty extension objects, so a token without metadata stays equal to one loaded from JSON
  const $extensions = {
    ...omit(payload.$extensions ?? {}, 'studio.tokens'),
    ...(Object.keys(studioTokensExtension).length > 0 ? { 'studio.tokens': studioTokensExtension } : {}),
  };

  return {
    name: payload.name,
    value: payload.value,
    type: payload.type,
    ...(Object.keys($extensions).length > 0 ? { $extensions } : {}),
    ...(payload.description ? {
      description: payload.description,
    } : {}),
    ...(payload.$deprecated ? {
      $deprecated: payload.$deprecated,
    } : {}),
  } as SingleToken;
}

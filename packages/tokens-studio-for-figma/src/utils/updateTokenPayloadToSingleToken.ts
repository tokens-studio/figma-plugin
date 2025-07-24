import { UpdateTokenPayload } from '@/types/payloads';
import { SingleToken } from '@/types/tokens';
import validateStudioTokensExtensions from './validateStudioTokensExtensions';

export function updateTokenPayloadToSingleToken(
  payload: UpdateTokenPayload,
  id?: string,
): SingleToken {
  const studioTokensExtension = validateStudioTokensExtensions(payload);

  return {
    name: payload.name,
    value: payload.value,
    type: payload.type,
    $extensions: {
      ...payload.$extensions,
      'studio.tokens': {
        ...(id ? { id } : {}),
        ...studioTokensExtension,
      },
    },
    ...(payload.description ? {
      description: payload.description,
    } : {}),
  } as SingleToken;
}

import { UpdateTokenPayload } from '@/types/payloads';
import { SingleToken } from '@/types/tokens';
import validateStudioTokensExtensions from './validateStudioTokensExtensions';

export function updateTokenPayloadToSingleToken(
  payload: UpdateTokenPayload,
): SingleToken {
  const studioTokensExtension = validateStudioTokensExtensions(payload);

  return {
    name: payload.name,
    value: payload.value,
    type: payload.type,
    ...(studioTokensExtension ? {
      $extensions: {
        ...payload.$extensions,
        'studio.tokens': {
          ...studioTokensExtension,
        },
      },
    } : payload.$extensions ? {
      $extensions: payload.$extensions,
    } : {}),
    ...(payload.description ? {
      description: payload.description,
    } : {}),
  } as SingleToken;
}

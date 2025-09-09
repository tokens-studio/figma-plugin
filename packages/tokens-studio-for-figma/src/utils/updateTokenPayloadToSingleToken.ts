import { UpdateTokenPayload } from '@/types/payloads';
import { SingleToken } from '@/types/tokens';
import validateStudioTokensExtensions from './validateStudioTokensExtensions';

export function updateTokenPayloadToSingleToken(
  payload: UpdateTokenPayload,
): SingleToken {
  const studioTokensExtension = validateStudioTokensExtensions(payload);

  let extensions = {};
  if (studioTokensExtension) {
    extensions = {
      $extensions: {
        ...payload.$extensions,
        'studio.tokens': {
          ...studioTokensExtension,
        },
      },
    };
  } else if (payload.$extensions) {
    extensions = {
      $extensions: payload.$extensions,
    };
  }

  return {
    name: payload.name,
    value: payload.value,
    type: payload.type,
    ...extensions,
    ...(payload.description ? {
      description: payload.description,
    } : {}),
  } as SingleToken;
}

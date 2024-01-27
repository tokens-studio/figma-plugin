import { UpdateTokenPayload } from '@/types/payloads';
import { SingleToken } from '@/types/tokens';

export function updateTokenPayloadToSingleToken(
  payload: UpdateTokenPayload,
  id?: string,
): SingleToken {
  return {
    name: payload.name,
    value: payload.value,
    type: payload.type,
    $extensions: {
      ...payload.$extensions,
      ...(payload.$extensions?.['studio.tokens'] ? {
        'studio.tokens': {
          ...(id ? { id } : {}),
          ...payload.$extensions['studio.tokens'],
          modify: payload.$extensions['studio.tokens']?.modify,
        },
      } : {}),
    },
    ...(payload.description ? {
      description: payload.description,
    } : {}),
  } as SingleToken;
}

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
      'studio.tokens': {
        ...(id ? { id } : {}),
        ...payload?.$extensions?.['studio.tokens'],
      },
    },
    ...(payload.description ? {
      description: payload.description,
    } : {}),
  } as SingleToken;
}

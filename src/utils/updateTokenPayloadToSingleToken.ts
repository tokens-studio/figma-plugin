import { v4 as uuidv4 } from 'uuid';
import { UpdateTokenPayload } from '@/types/payloads';
import { SingleToken } from '@/types/tokens';

export function updateTokenPayloadToSingleToken(
  payload: UpdateTokenPayload,
  id: string = uuidv4(),
): SingleToken {
  return {
    name: payload.name,
    value: payload.value,
    type: payload.type,
    $extensions: {
      ...payload.$extensions,
      ...(id ? { id } : {}),
      ...(payload.$extensions?.['studio.tokens'] ? {
        'studio.tokens': {
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

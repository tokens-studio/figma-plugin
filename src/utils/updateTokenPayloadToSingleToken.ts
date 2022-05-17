import { UpdateTokenPayload } from '@/types/payloads';
import { SingleToken } from '@/types/tokens';

export function updateTokenPayloadToSingleToken(
  payload: UpdateTokenPayload,
): SingleToken {
  return {
    name: payload.name,
    value: payload.value,
    type: payload.type,
    ...(payload.description ? {
      description: payload.description,
    } : {}),
  } as SingleToken;
}

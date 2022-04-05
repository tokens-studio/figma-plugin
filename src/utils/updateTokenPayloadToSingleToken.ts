import { UpdateTokenPayload } from '@/types/payloads';
import { SingleToken } from '@/types/tokens';

export function updateTokenPayloadToSingleToken(
  payload: UpdateTokenPayload,
): SingleToken {
  return {
    name: payload.name,
    value: payload.value,
    type: payload.options.type,
    ...(payload.options.description ? {
      description: payload.options.description,
    } : {}),
  } as SingleToken;
}

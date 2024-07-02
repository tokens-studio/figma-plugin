import { AliasRegex } from '@/constants/AliasRegex';
import { UpdateTokenVariablePayload } from '@/types/payloads/UpdateTokenVariablePayload';
import { SingleToken } from '@/types/tokens';

export function checkCanReferenceVariable(payload: UpdateTokenVariablePayload | SingleToken<true, { path: string, variableId: string }>) {
  return payload.rawValue?.toString().match(AliasRegex)?.length === 1 && !payload?.$extensions?.['studio.tokens']?.modify;
}

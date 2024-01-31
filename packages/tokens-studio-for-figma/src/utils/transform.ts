import { SetTokenDataPayload } from '@/types/payloads';
import convertTokensObjectToResolved from './convertTokensObjectToResolved';
import { TransformerOptions } from './types';

type Input = SetTokenDataPayload['values'];

function transform(input: Input, sets: string[], excludes: string[], options: TransformerOptions) {
  return convertTokensObjectToResolved(input, sets, excludes, options);
}

export default transform;

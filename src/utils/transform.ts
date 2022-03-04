import convertTokensObjectToResolved from './convertTokensObjectToResolved';
import { TransformerOptions } from './types';

function transform(tokens, usedSets, excludedSets, options: TransformerOptions) {
  return convertTokensObjectToResolved({
    tokens, usedSets, excludedSets, options,
  });
}

export default transform;

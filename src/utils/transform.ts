import convertTokensObjectToResolved from './convertTokensObjectToResolved';
import { TransformerOptions } from './types';

function transform(input, sets, excludes, options: TransformerOptions) {
  return convertTokensObjectToResolved(input, sets, excludes, options);
}

export default transform;

import convertTokensObjectToResolved from './convertTokensObjectToResolved';

function transform(input, sets, excludes) {
  return convertTokensObjectToResolved(input, sets, excludes);
}

export default transform;

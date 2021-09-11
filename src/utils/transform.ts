import convertTokensObjectToResolved from './convertTokensObjectToResolved';

function transform(input, usedSets = []) {
    return convertTokensObjectToResolved(input, usedSets);
}

export default transform;

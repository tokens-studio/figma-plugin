import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken } from '@/types/tokens';

export default function getResolvedTextValue(token: SingleToken) {
  let returnValue: string = '';
  if (token.type === TokenTypes.TYPOGRAPHY || token.type === TokenTypes.BOX_SHADOW) {
    if (Array.isArray(token.value)) {
      const array = token.value.reduce<Array<string>>((totalAcc, item) => {
        const singleReturnValue = Object.entries(item).reduce<Array<string>>((acc, [, propertyValue]) => (
          acc.concat(`${propertyValue.toString()}`)
        ), []);
        return totalAcc.concat(`${singleReturnValue.join('/')}`);
      }, []);
      returnValue = array.join(',');
    } else {
      const array = Object.entries(token.value).reduce<Array<string>>((acc, [, propertyValue]) => (
        acc.concat(`${propertyValue.toString()}`)
      ), []);
      returnValue = array.join('/');
    }
  } else if (token.type === TokenTypes.COMPOSITION) {
    const array = Object.entries(token.value).reduce<Array<string>>((acc, [property, value]) => (
      acc.concat(`${property}:${value}`)
    ), []);
    returnValue = array.join(',');
  } else if (typeof token.value === 'string' || typeof token.value === 'number') {
    returnValue = token.value;
  }
  return returnValue;
}

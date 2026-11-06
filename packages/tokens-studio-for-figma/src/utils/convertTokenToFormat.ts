import { TokenFormat } from '@/plugin/TokenFormatStoreClass';
import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken } from '@/types/tokens';
import { convertToDefaultProperty } from './convertToDefaultProperty';
import { isNumericValueToken } from './numericValueTokenTypes';
import { processNumberValue } from './processNumberValue';

export function convertTokenToFormat(token, isExpanded = false) {
  if (token.inheritTypeLevel) delete token.type;
  const {
    type, value, description, ...remainingTokenValues
  } = token;
  if (isExpanded) {
    const returnedToken = {};
    Object.entries(token).forEach(([key, val]) => {
      // A numeric font weight inside a composite token (e.g. the fontWeight
      // of an expanded typography token) is exported as a number, like
      // standalone number/fontWeights tokens.
      if (convertToDefaultProperty(key) === TokenTypes.FONT_WEIGHTS) {
        returnedToken[key] = processNumberValue(val as SingleToken['value']);
      } else {
        returnedToken[key] = convertTokenToFormat(val);
      }
    });
    return returnedToken;
  }
  if ((typeof value === 'undefined')) return token;
  const returnValue = {
    ...remainingTokenValues,
    // Use explicit undefined check instead of truthy check to include falsy values like 0
    ...(value !== undefined ? {
      [TokenFormat.tokenValueKey]: isNumericValueToken(type) ? processNumberValue(value) : value,
    } : {}),
    ...(type ? { [TokenFormat.tokenTypeKey]: type } : {}),
    ...(description ? { [TokenFormat.tokenDescriptionKey]: description } : {}),
  };
  delete returnValue.inheritTypeLevel;
  return returnValue;
}

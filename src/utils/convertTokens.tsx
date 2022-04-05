import { SingleToken } from '@/types/tokens';
import { isSingleBoxShadowToken, isSingleTokenValueObject, isSingleTypographyToken } from './is';

// @TODO fix typings
function checkForTokens({
  obj,
  token,
  root = null,
  returnValuesOnly = false,
  expandTypography = false,
  expandShadow = false,
}): [SingleToken[], SingleToken] {
  // replaces / in token name
  let returnValue;
  const shouldExpandTypography = expandTypography ? isSingleTypographyToken(token.value) : false;
  const shouldExpandShadow = expandShadow ? isSingleBoxShadowToken(token.value) : false;
  if (isSingleTokenValueObject(token) && !shouldExpandTypography && !shouldExpandShadow) {
    returnValue = token;
  } else if (
    (isSingleTypographyToken(token) && !expandTypography)
    || (isSingleBoxShadowToken(token) && !expandShadow)
  ) {
    returnValue = {
      type: token.type,
      value: Object.entries(token).reduce((acc, [key, val]) => {
        acc[key] = isSingleTokenValueObject(val) && returnValuesOnly ? val.value : val;
        return acc;
      }, {}),
    };

    if (token.description) {
      delete returnValue.value.description;
      returnValue.description = token.description;
    }
  } else if (typeof token === 'object') {
    let tokenToCheck = token;
    if (isSingleTokenValueObject(token)) {
      tokenToCheck = token.value;
    }
    Object.entries(tokenToCheck).map(([key, value]) => {
      const [, result] = checkForTokens({
        obj,
        token: value,
        root: [root, key].filter((n) => n).join('.'),
        returnValuesOnly,
        expandTypography,
        expandShadow,
      });
      if (root && result) {
        obj.push({ name: [root, key].join('.'), ...result });
      } else if (result) {
        obj.push({ name: key, ...result });
      }
    });
  } else {
    returnValue = {
      value: token,
    };
  }

  if (returnValue?.name) {
    returnValue.name = returnValue.name.split('/').join('.');
  }

  return [obj, returnValue];
}

export default function convertToTokenArray({
  tokens, returnValuesOnly = false, expandTypography = false, expandShadow = false,
}) {
  const [result] = checkForTokens({
    obj: [], token: tokens, returnValuesOnly, expandTypography, expandShadow,
  });
  return Object.values(result);
}

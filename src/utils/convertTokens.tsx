import { SingleToken, SingleTokenObject } from '@/types/tokens';
import { isTypographyToken, isShadowToken, isValueToken } from '../app/components/utils';

function checkForTokens({
  obj,
  token,
  root = null,
  returnValuesOnly = false,
  expandTypography = false,
  expandShadow = false,
}): [SingleTokenObject[], SingleToken] {
  // replaces / in token name
  let returnValue;
  const shouldExpandTypography = expandTypography ? isTypographyToken(token.value) : false;
  const shouldExpandShadow = expandShadow ? isShadowToken(token.value) : false;
  if (isValueToken(token) && !shouldExpandTypography && !shouldExpandShadow) {
    returnValue = token;
  } else if (isTypographyToken(token) && !expandTypography) {
    returnValue = {
      type: 'typography',
      value: Object.entries(token).reduce((acc, [key, val]) => {
        acc[key] = isValueToken(val) && returnValuesOnly ? val.value : val;
        return acc;
      }, {}),
    };

    if (token.description) {
      delete returnValue.value.description;
      returnValue.description = token.description;
    }
  } else if (isShadowToken(token) && !expandShadow) {
    returnValue = {
      type: 'boxShadow',
      value: Object.entries(token).reduce((acc, [key, val]) => {
        acc[key] = isValueToken(val) && returnValuesOnly ? val.value : val;
        return acc;
      }, {}),
    };

    if (token.description) {
      delete returnValue.value.description;
      returnValue.description = token.description;
    }
  } else if (typeof token === 'object') {
    let tokenToCheck = token;
    if (isValueToken(token)) {
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

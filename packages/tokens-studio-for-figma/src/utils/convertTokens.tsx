import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken } from '@/types/tokens';
import {
  isSingleBorderToken,
  isSingleBoxShadowToken,
  isSingleCompositionToken,
  isSingleTokenValueObject,
  isSingleTypographyToken,
} from './is';
import { TokenGroupInJSON, isTokenGroupWithType } from './is/isTokenGroupWithType';
import { TokenFormat } from '@/plugin/TokenFormatStoreClass';
import { isSingleTokenInJSON } from './is/isSingleTokenInJson';

// This is a token as it is incoming, so we can't be sure of the values or types
export type TokenInJSON<T extends TokenTypes = any, V = any> = {
  $extensions?: {
    [key: string]: any;
    'studio.tokens'?: {
      [key: string]: any;
      id?: string;
      modify?: any;
    };
    id?: string;
  };
} & (
  | {
    type: T;
    value: V;
    description?: string;
  }
  | {
    $type: T;
    $value: V;
    $description?: string;
  }
);

export type Tokens =
  | Partial<Record<string, Partial<Record<TokenTypes, Record<string, TokenInJSON>>>>>
  | TokenGroupInJSON;

// @TODO fix typings
function checkForTokens({
  obj,
  token,
  root = null,
  returnValuesOnly = false,
  expandTypography = false,
  expandShadow = false,
  expandComposition = false,
  expandBorder = false,
  inheritType,
  groupLevel = 0,
  currentTypeLevel = 0,
}: {
  obj: SingleToken<true>[];
  token: Tokens | TokenGroupInJSON;
  root: string | null;
  returnValuesOnly?: boolean;
  expandTypography?: boolean;
  expandShadow?: boolean;
  expandComposition?: boolean;
  expandBorder?: boolean;
  inheritType?: string;
  groupLevel?: number;
  currentTypeLevel?: number;
}): [SingleToken[], SingleToken | undefined] {
  let returnValue:
  | Pick<SingleToken<false>, 'name' | 'value' | 'description'>
  | {
    type: TokenTypes;
    value: Record<string, SingleToken['value']>;
    description?: string;
  }
  | undefined;
  if (isSingleTokenInJSON(token)) {
    const {
      [TokenFormat.tokenValueKey]: value,
      [TokenFormat.tokenTypeKey]: type,
      [TokenFormat.tokenDescriptionKey]: description,
      ...remainingTokenProperties
    } = token;
    returnValue = {
      value,
      ...(!type && inheritType
        ? { type: inheritType as TokenTypes, inheritTypeLevel: currentTypeLevel }
        : { type: type as TokenTypes }),
      ...(description && typeof description === 'string' ? { description } : {}),
      ...remainingTokenProperties,
    };
  } else if (
    isSingleTypographyToken(token)
    || isSingleBoxShadowToken(token)
    || isSingleCompositionToken(token)
    || isSingleBorderToken(token)
  ) {
    const {
      [TokenFormat.tokenValueKey]: value,
      [TokenFormat.tokenTypeKey]: type,
      [TokenFormat.tokenDescriptionKey]: description,
      ...remainingTokenProperties
    } = token;
    returnValue = {
      type: type as TokenTypes,
      value: Object.entries(token).reduce<Record<string, SingleToken['value']>>((acc, [key, val]) => {
        acc[key] = isSingleTokenValueObject(val) && returnValuesOnly ? val[TokenFormat.tokenValueKey] : val;
        return acc;
      }, {}),
      ...(description && typeof description === 'string' ? { description } : {}),
      ...remainingTokenProperties,
    };
  } else if (typeof token === 'object') {
    // We dont have a single token value key yet, so it's likely a group which we need to iterate over
    // This would be where we push a `group` entity to the array, once we do want to tackle group descriptions or group metadata
    let tokenToCheck = token;
    groupLevel += 1;
    // When token groups are typed, we need to inherit the type to their children
    if (isTokenGroupWithType(token)) {
      const { [TokenFormat.tokenTypeKey]: groupType, ...tokenValues } = token;
      inheritType = groupType as unknown as TokenTypes;
      currentTypeLevel = groupLevel;
      tokenToCheck = tokenValues as Tokens;
    }

    if (typeof tokenToCheck !== 'undefined' || tokenToCheck !== null) {
      Object.entries(tokenToCheck).forEach(([key, value]) => {
        const [, result] = checkForTokens({
          obj,
          token: value as TokenGroupInJSON,
          root: [root, key].filter((n) => n).join('.'),
          returnValuesOnly,
          expandTypography,
          expandShadow,
          expandComposition,
          expandBorder,
          inheritType,
          groupLevel,
          currentTypeLevel,
        });
        if (root && result) {
          obj.push({ ...result, name: [root, key].join('.') });
        } else if (result) {
          obj.push({ ...result, name: key });
        }
      });
    }
  } else {
    // If all else fails, we just return the token as the value, and type as other
    returnValue = {
      value: token,
    };
  }

  if (typeof returnValue === 'object' && 'name' in returnValue && returnValue?.name) {
    returnValue.name = returnValue.name.split('/').join('.');
  }

  return [obj, returnValue as SingleToken | undefined];
}

export default function convertToTokenArray({ tokens }: { tokens: Tokens }) {
  const [result] = checkForTokens({
    obj: [],
    root: null,
    token: tokens,
  });
  return Object.values(result);
}

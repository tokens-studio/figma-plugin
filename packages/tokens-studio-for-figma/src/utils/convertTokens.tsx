import { TokenTypes } from '@/constants/TokenTypes';
import { AnyTokenList, SingleToken } from '@/types/tokens';
import {
  isSingleBorderToken,
  isSingleBoxShadowToken,
  isSingleCompositionToken,
  isSingleTokenValueObject,
  isSingleTypographyToken,
} from './is';
import { isTokenGroupWithType } from './is/isTokenGroupWithType';
import { TokenFormat } from '@/plugin/store';

type Tokens =
  | AnyTokenList
  | Partial<
  | Record<string, Partial<Record<TokenTypes, Record<string, SingleToken<false>>>>>
  | { $value: Pick<SingleToken, 'value'> }
  | { type: string }
  | { $type: string }
  | { inheritType: string }
  >;

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
  token: Tokens;
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
  // replaces / in token name
  let returnValue:
  | Pick<SingleToken<false>, 'name' | 'value' | 'description'>
  | {
    type: TokenTypes;
    value: Record<string, SingleToken['value']>;
    description?: string;
  }
  | undefined;
  if (isSingleTokenValueObject(token)) {
    const {
      // @ts-ignore
      [TokenFormat.tokenValueKey]: value,
      // @ts-ignore
      [TokenFormat.tokenTypeKey]: type,
      // @ts-ignore
      [TokenFormat.tokenDescriptionKey]: description,
      ...remainingTokenProperties
    } = token;
    returnValue = {
      ...remainingTokenProperties,
      value,
      ...(description ? { description } : {}),
      ...(!(TokenFormat.tokenTypeKey in token) && inheritType
        ? { type: inheritType, inheritTypeLevel: currentTypeLevel }
        : { type }),
    };
  } else if (
    isSingleTypographyToken(token)
    || isSingleBoxShadowToken(token)
    || isSingleCompositionToken(token)
    || isSingleBorderToken(token)
  ) {
    returnValue = {
      type: token[TokenFormat.tokenTypeKey],
      value: Object.entries(token).reduce<Record<string, SingleToken['value']>>((acc, [key, val]) => {
        acc[key] = isSingleTokenValueObject(val) && returnValuesOnly ? val[TokenFormat.tokenValueKey] : val;
        return acc;
      }, {}),
      ...(token[TokenFormat.tokenDescriptionKey] ? { description: token[TokenFormat.tokenDescriptionKey] } : {}),
    };
  } else if (typeof token === 'object') {
    let tokenToCheck = token;
    if (!isSingleTokenValueObject(token)) {
      groupLevel += 1;
    }
    // When token groups are typed, we need to inherit the type to their children
    if (isTokenGroupWithType(token)) {
      const { [TokenFormat.tokenTypeKey]: groupType, ...tokenValues } = token;
      inheritType = groupType;
      currentTypeLevel = groupLevel;
      tokenToCheck = tokenValues as Tokens;
    }
    if (isSingleTokenValueObject(token) && typeof token[TokenFormat.tokenValueKey] !== 'string') {
      tokenToCheck = token[TokenFormat.tokenValueKey] as typeof tokenToCheck;
    }
    Object.entries(tokenToCheck).forEach(([key, value]) => {
      const [, result] = checkForTokens({
        obj,
        token: value,
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
  } else {
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

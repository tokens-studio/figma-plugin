import set from 'set-value';
import extend from 'just-extend';
import tokenTypes from '../../config/tokenTypes';
import { SingleToken } from '@/types/tokens';
import { TokenTypes } from '@/constants/TokenTypes';

function transformName(name: string): TokenTypes {
  switch (name) {
    case 'color':
    case 'colors':
      return TokenTypes.COLOR;
    case 'space':
    case 'spacing':
      return TokenTypes.SPACING;
    case 'size':
    case 'sizing':
      return TokenTypes.SIZING;
    case 'boxShadow':
      return TokenTypes.BOX_SHADOW;
    case 'border':
      return TokenTypes.BORDER;
    case 'borderRadius':
      return TokenTypes.BORDER_RADIUS;
    case 'borderWidth':
      return TokenTypes.BORDER_WIDTH;
    case 'opacity':
      return TokenTypes.OPACITY;
    case 'fontFamilies':
      return TokenTypes.FONT_FAMILIES;
    case 'fontWeights':
      return TokenTypes.FONT_WEIGHTS;
    case 'fontSizes':
      return TokenTypes.FONT_SIZES;
    case 'lineHeights':
      return TokenTypes.LINE_HEIGHTS;
    case 'typography':
      return TokenTypes.TYPOGRAPHY;
    case 'letterSpacing':
      return TokenTypes.LETTER_SPACING;
    case 'paragraphSpacing':
      return TokenTypes.PARAGRAPH_SPACING;
    default:
      return TokenTypes.OTHER;
  }
}

export function appendTypeToToken(token) {
  const hasTypeProp = token.type && token.type !== '' && token.type !== 'undefined';
  const typeToSet = hasTypeProp ? token.type : transformName(token.name.split('.').slice(0, 1).toString());
  return {
    ...token,
    type: typeToSet,
  };
}

// Creates a tokens object so that tokens are displayed in groups in the UI.
export function createTokensObject(tokens: SingleToken[], tokenFilter = '') {
  if (tokens.length > 0) {
    const obj = tokens.reduce((acc, cur) => {
      if (tokenFilter === '' || cur.name?.toLowerCase().search(tokenFilter?.toLowerCase()) >= 0) {
        const hasTypeProp = cur.type && cur.type !== '' && cur.type !== 'undefined';
        const propToSet = hasTypeProp ? cur.type : transformName(cur.name.split('.').slice(0, 1).toString());
        acc[propToSet] = acc[propToSet] || { values: {} };
        acc[propToSet].values = acc[propToSet].values || {};
        set(acc[propToSet].values, cur.name, { ...cur, type: hasTypeProp ? cur.type : propToSet });
      }
      return acc;
    }, {});
    return obj;
  }
  return {};
}

// Takes an array of tokens, transforms them into
// san object and merges that with values we require for the UI
export function mappedTokens(tokens: SingleToken[], tokenFilter: string) {
  const tokenObj = {};

  extend(true, tokenObj, tokenTypes);

  Object.entries(createTokensObject(tokens, tokenFilter)).forEach(
    ([key, group]: [string, { values: SingleToken[]; type?: TokenType }]) => {
      tokenObj[key] = {
        values: group.values,
      };
    },
  );

  extend(true, tokenObj, tokenTypes);

  return Object.entries(tokenObj);
}

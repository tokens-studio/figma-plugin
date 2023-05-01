import getResolvedTextValue from './getResolvedTextValue';
import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken } from '@/types/tokens';

describe('getResolvedTextValue', () => {
  it('returns empty string for invalid token type', () => {
    const token = {
      type: 'INVALID_TYPE',
      value: {},
    } as unknown as SingleToken;
    expect(getResolvedTextValue(token)).toEqual('');
  });

  it('returns resolved value for typography token with object value', () => {
    const token = {
      type: TokenTypes.TYPOGRAPHY,
      value: {
        fontSize: '16px',
        lineHeight: '1.5',
      },
    } as unknown as SingleToken;
    expect(getResolvedTextValue(token)).toEqual('16px/1.5');
  });

  it('returns resolved value for box shadow token with single value', () => {
    const token = {
      type: TokenTypes.BOX_SHADOW,
      value: {
        x: '10px',
        y: '20px',
        blur: '30px',
        color: '#000',
      },
    } as unknown as SingleToken;
    expect(getResolvedTextValue(token)).toEqual('10px/20px/30px/#000');
  });

  it('returns resolved value for box shadow token with multiple values', () => {
    const token = {
      type: TokenTypes.BOX_SHADOW,
      value: [
        {
          x: '10px',
          y: '20px',
          blur: '30px',
          color: '#000',
        },
        {
          x: '5px',
          y: '10px',
          blur: '15px',
          color: '#fff',
        },
      ],
    } as unknown as SingleToken;
    expect(getResolvedTextValue(token)).toEqual('10px/20px/30px/#000,5px/10px/15px/#fff');
  });

  it('returns resolved value for composition token with object value', () => {
    const token = {
      type: TokenTypes.COMPOSITION,
      value: {
        sizing: '300px',
        color: '#fff',
        borderRadius: '13px',
      },
    } as unknown as SingleToken;
    expect(getResolvedTextValue(token)).toEqual('sizing:300px,color:#fff,borderRadius:13px');
  });

  it('returns resolved value for string or number token', () => {
    const token1: SingleToken = {
      type: TokenTypes.SIZING,
      value: '12px',
    } as unknown as SingleToken;

    expect(getResolvedTextValue(token1)).toEqual('12px');
  });
});

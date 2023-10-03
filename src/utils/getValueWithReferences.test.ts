import { getValueWithReferences } from './getValueWithReferences';
import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken } from '@/types/tokens';

describe('getValueWithReferences', () => {
  it('should return value of token if the raw value is undefined', () => {
    const token = {
      type: TokenTypes.TYPOGRAPHY,
      value: {
        fontSize: '16px',
        lineHeight: '1.5',
      },
    } as unknown as SingleToken;
    expect(getValueWithReferences(token, {
      expandTypography: true,
      expandShadow: true,
      expandComposition: false,
      expandBorder: true,
      preserveRawValue: false,
      resolveReferences: false,
    })).toEqual({
      fontSize: '16px',
      lineHeight: '1.5',
    });
  });

  it('should return complex value in case of typography token', () => {
    const token = {
      type: TokenTypes.TYPOGRAPHY,
      value: {
        fontSize: '16px',
        lineHeight: '1.5',
      },
      rawValue: {
        fontSize: '16px',
        lineHeight: '1.5',
      },
    } as unknown as SingleToken;
    expect(getValueWithReferences(token, {
      expandTypography: true,
      expandShadow: true,
      expandComposition: false,
      expandBorder: true,
      preserveRawValue: false,
      resolveReferences: false,
    })).toEqual({
      fontSize: '16px',
      lineHeight: '1.5',
    });
  });

  it('shoud return array of complex value in case of typography array token', () => {
    const token = {
      type: TokenTypes.TYPOGRAPHY,
      value: [
        {
          fontSize: '16px',
          lineHeight: '1.5',
        },
        {
          borderRadius: '4px',
        },
      ],
      rawValue: [
        {
          fontSize: '16px',
          lineHeight: '1.5',
        },
        {
          borderRadius: '4px',
        },
      ],
    } as unknown as SingleToken;
    expect(getValueWithReferences(token, {
      expandTypography: true,
      expandShadow: true,
      expandComposition: false,
      expandBorder: true,
      preserveRawValue: false,
      resolveReferences: false,
    })).toEqual([
      {
        fontSize: '16px',
        lineHeight: '1.5',
      },
      {
        borderRadius: '4px',
      },
    ]);
  });
});

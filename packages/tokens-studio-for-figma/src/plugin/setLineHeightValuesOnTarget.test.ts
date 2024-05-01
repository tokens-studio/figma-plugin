import { TokenTypes } from '@/constants/TokenTypes';
import { defaultTokenValueRetriever } from './TokenValueRetriever';
import setLineHeightValuesOnTarget from './setLineHeightValuesOnTarget';
import { SingleToken } from '@/types/tokens';

const lineHeightToken: SingleToken = {
  name: 'lineHeight.large',
  type: TokenTypes.NUMBER,
  value: '36px',
};

const tokens: SingleToken[] = [lineHeightToken];

describe('setLineHeightValuesOnTarget', () => {
  let textNodeMock;

  beforeEach(() => {
    defaultTokenValueRetriever.initiate({
      tokens,
    });
    textNodeMock = {
      description: '',
      type: 'TEXT',
      fontName: {
        family: 'Inter',
        style: 'Regular',
      },
      textCase: 'NONE',
      textDecoration: 'NONE',
      fontSize: 99,
      paragraphSpacing: 99,
      paragraphIndent: 99,
      letterSpacing: 99,
      lineHeight: 99,
    };
  });

  it('sets line height property if those are given', async () => {
    const mockLineHeightValue = {
      unit: 'PIXELS',
      value: 36
    } as LineHeight;
    await setLineHeightValuesOnTarget(textNodeMock, mockLineHeightValue);
    expect(textNodeMock).toEqual({ ...textNodeMock, lineHeight: { unit: 'PIXELS', value: 36 }});
  });
});

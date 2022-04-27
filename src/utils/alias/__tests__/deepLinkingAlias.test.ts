import { getAliasValue } from '../getAliasValue';
import { SingleToken } from '@/types/tokens';

describe('deepLinkingAlias', () => {
  const inputTokens = [
    {
      name: 'font-size.tokenvalue',
      input: '$typography.tokensize.fontSize',
      value: '16px',
    },
    {
      name: 'font-size.pixelsize',
      input: '$typography.pixelsize.fontSize',
      value: '5px',
    },
    {
      name: 'font-size.numbersize',
      input: '$typography.numbersize.fontSize',
      value: 10,
    },
    {
      name: 'font-weight.bold',
      input: '$typography.tokensize.fontWeight',
      value: 'bold',
    }
  ]

  const allTokens = [
    {
      name: 'typography.tokensize',
      rawValue: {
        fontSize: '$16',
        fontWeight: 'bold'
      },
      value: '4px'
    },
    {
      name: 'typography.pixelsize',
      rawValue: {
        fontSize: '5px',
        fontWeight: 'bold'
      },
      value: '5px'
    },
    {
      name: 'typography.numbersize',
      rawValue: {
        fontSize: 10,
        fontWeight: 'bold'
      },
      value: 10
    },
    {
      name: '16',
      value: '16px'
    }
  ]

  inputTokens.forEach((token) => {
    it(`alias ${token.name}`, () => {
      expect(getAliasValue({ value: token.input } as SingleToken, allTokens as unknown as SingleToken[])).toEqual(token.value);
    });
  });
});

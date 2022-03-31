import { getAliasValue } from '../getAliasValue';
import { SingleToken } from '@/types/tokens';

describe('getAliasValue', () => {
  const allTokens = [
    {
      name: 'colors.hex',
      input: '#ff0000',
      value: '#ff0000',
    },
    {
      name: 'colors.rgba',
      input: 'rgba(0, 255, 0, 0.5)',
      value: '#00ff0080',
    },
    {
      name: 'colors.rgbaalias',
      input: 'rgba($colors.hex, 0.5)',
      value: '#ff000080',
    },
    {
      name: 'colors.lightness_base',
      input: '25',
      value: 25,
    },
    {
      name: 'colors.lightness',
      input: '$colors.lightness_base * 3.5 + 0.175',
      value: 87.675,
    },
    {
      name: 'colors.hsla_1',
      input: 'hsl(172,50%,{colors.lightness_base}%)',
      value: '#206057',
    },
    {
      name: 'colors.hsla_2',
      input: 'hsl(172,50%,{colors.lightness}%)',
      value: '#d0efeb',
    },
    {
      name: 'colors.hsla_3',
      input: 'hsla(172,50%,{colors.lightness}%, 0.5)',
      value: '#d0efeb80',
    },
    {
      name: 'alias.complex',
      input: '$base.scale * $base.ratio ^ round((200 + 400 - $base.index) / 100)',
      value: 8,
    },
    {
      name: 'alias.round2',
      input: '$alias.complex + $alias.complex * ((1100 - 400) / 100)',
      value: 64,
    },
    {
      name: 'alias.round3',
      input: '$alias.round2 * 1.5',
      value: 96,
    },
    {
      name: 'colors.zero',
      input: 0,
      value: 0,
    },
    {
      name: 'base.scale',
      input: '2',
      value: 2,
    },
    {
      name: 'base.ratio',
      input: '2',
      value: 2,
    },
    {
      name: 'base.index',
      input: '400',
      value: 400,
    },
    {
      name: 'alias.cantresolve',
      input: 'rgba({notexisting}, 1)',
      value: 'rgba({notexisting}, 1)',
    },
    {
      name: 'alias.cantresolveopacity',
      input: 'rgba(255, 255, 0, {notexisting})',
      value: 'rgba(255, 255, 0, {notexisting})',
    },
    {
      name: 'colors.the one with spaces',
      input: '#ff0000',
      value: '#ff0000',
    },
    {
      name: 'colors.aliasspaces',
      input: '{colors.the one with spaces}',
      value: '#ff0000',
    },
  ];

  allTokens.forEach((token) => {
    it(`alias ${token.name}`, () => {
      // @TODO check this test typing
      expect(getAliasValue({ value: token.input } as SingleToken, allTokens as unknown as SingleToken[])).toEqual(token.value);
    });
  });
});

import pullVariables from './pullVariables';
import * as notifiers from './notifiers';
import { TokenTypes } from '@/constants/TokenTypes';

const variable = (resolvedType: string) => (name: string, value: unknown, scopes: string[]) => ({
  name,
  remote: false,
  resolvedType,
  variableCollectionId: 'coll1',
  scopes,
  valuesByMode: { '1:0': value },
});
const float = variable('FLOAT');
const string = variable('STRING');

jest.mock('./getVariablesWithoutZombies', () => ({
  getVariablesWithoutZombies: jest.fn(),
}));

jest.mock('@/AsyncMessageChannel', () => ({
  AsyncMessageChannel: {
    PluginInstance: {
      message: jest.fn().mockResolvedValue({ themes: [] }),
    },
  },
}));

global.figma = {
  ui: {
    postMessage: jest.fn(),
  },
  clientStorage: {
    getAsync: jest.fn().mockResolvedValue(JSON.stringify({ baseFontSize: 16 })),
  },
  variables: {
    getLocalVariableCollectionsAsync: jest.fn().mockResolvedValue([]),
    getVariableCollectionByIdAsync: jest.fn().mockResolvedValue({
      id: 'coll1',
      name: 'Core',
      modes: [{ name: 'Default', modeId: '1:0' }],
    }),
    getVariableById: jest.fn().mockReturnValue({ name: 'fontWeight/regular', id: 'aliasId' }),
  },
} as any;

describe('pullVariables font weights', () => {
  const notifyStyleValuesSpy = jest.spyOn(notifiers, 'notifyVariableValues');
  const { getVariablesWithoutZombies } = jest.requireMock('./getVariablesWithoutZombies');

  beforeEach(() => {
    notifyStyleValuesSpy.mockClear();
    getVariablesWithoutZombies.mockResolvedValue([
      float('fontWeight/regular', 400, ['FONT_WEIGHT']),
      float('fontWeight/alias', { type: 'VARIABLE_ALIAS', id: 'aliasId' }, ['FONT_WEIGHT']),
      float('weightOrSize', 400, ['FONT_WEIGHT', 'FONT_SIZE']),
      float('anything', 400, ['ALL_SCOPES']),
      string('fontWeight/heading', 'Bold', ['FONT_STYLE']),
      string('fontWeight/headingAlias', { type: 'VARIABLE_ALIAS', id: 'aliasId' }, ['FONT_STYLE']),
      string('styleOrFamily', 'Bold', ['FONT_STYLE', 'FONT_FAMILY']),
      string('anyText', 'Bold', ['ALL_SCOPES']),
    ]);
  });

  const pulled = () => {
    const payload = notifyStyleValuesSpy.mock.calls[0][0];
    return Object.values(payload).flat().map(({ name, value, type }) => ({ name, value, type }));
  };

  it.each([
    ['plain numbers', {}, 400, TokenTypes.NUMBER],
    ['px dimensions', { useDimensions: true }, '400px', TokenTypes.DIMENSION],
    ['rem dimensions', { useRem: true }, '25rem', TokenTypes.DIMENSION],
  ])('imports variables scoped to font weight alone as fontWeights when importing %s', async (_, options, converted, convertedType) => {
    await pullVariables({ useDimensions: false, useRem: false, ...options }, [], false);

    expect(pulled()).toEqual(expect.arrayContaining([
      { name: 'fontWeight.regular', value: '400', type: TokenTypes.FONT_WEIGHTS },
      { name: 'fontWeight.alias', value: '{fontWeight.regular}', type: TokenTypes.FONT_WEIGHTS },
      // More scopes than font weight, or all scopes, are converted like any other number
      { name: 'weightOrSize', value: converted, type: convertedType },
      { name: 'anything', value: converted, type: convertedType },
    ]));
    expect(pulled()).toHaveLength(8);
  });

  it('imports string variables scoped to font style alone as fontWeights', async () => {
    await pullVariables({ useDimensions: false, useRem: false }, [], false);

    expect(pulled()).toEqual(expect.arrayContaining([
      { name: 'fontWeight.heading', value: 'Bold', type: TokenTypes.FONT_WEIGHTS },
      { name: 'fontWeight.headingAlias', value: '{fontWeight.regular}', type: TokenTypes.FONT_WEIGHTS },
      // More scopes than font style, or all scopes, stay text
      { name: 'styleOrFamily', value: 'Bold', type: TokenTypes.TEXT },
      { name: 'anyText', value: 'Bold', type: TokenTypes.TEXT },
    ]));
  });
});

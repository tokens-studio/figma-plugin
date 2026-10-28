// Guards the wiring in the export loop: every per-theme call to generateTokensToCreate
// (token count, platform pre-scan and updateVariables) must get a set pool with one
// option per other group, picked from the active theme, instead of the union of all
// exported themes.

import { mockCreateVariableCollection, mockGetLocalVariableCollections, mockGetLocalVariableCollectionsAsync } from '../../tests/__mocks__/figmaMock';
import { AsyncMessageTypes, GetThemeInfoMessageResult } from '@/types/AsyncMessages';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { TokenTypes } from '@/constants/TokenTypes';
import { SettingsState } from '@/app/store/models/settings';
import { SingleToken } from '@/types/tokens';
import { ThemeObject } from '@/types';

jest.mock('./generateTokensToCreate', () => ({
  generateTokensToCreate: jest.fn(() => ({ tokensToCreate: [], resolvedTokens: [] })),
}));

// eslint-disable-next-line import/first
import createLocalVariablesInPlugin from './createLocalVariablesInPlugin';
// eslint-disable-next-line import/first
import { generateTokensToCreate } from './generateTokensToCreate';

const mockGenerate = generateTokensToCreate as jest.MockedFunction<typeof generateTokensToCreate>;

describe('createLocalVariablesInPlugin — set pool per theme', () => {
  const runAfter: (() => void)[] = [];

  const themes: ThemeObject[] = [
    {
      id: 'a', name: 'A', group: 'brand', selectedTokenSets: { 'brand/a': TokenSetStatus.ENABLED }, $figmaStyleReferences: {},
    },
    {
      id: 'b', name: 'B', group: 'brand', selectedTokenSets: { 'brand/b': TokenSetStatus.ENABLED }, $figmaStyleReferences: {},
    },
    {
      id: 'charts', name: 'Charts', group: 'charts', selectedTokenSets: { charts: TokenSetStatus.ENABLED }, $figmaStyleReferences: {},
    },
  ];

  const mockGetThemeInfoHandler = async (): Promise<GetThemeInfoMessageResult> => ({
    type: AsyncMessageTypes.GET_THEME_INFO,
    activeTheme: { brand: 'a', charts: 'charts' },
    themes,
  });

  beforeAll(() => {
    runAfter.push(AsyncMessageChannel.ReactInstance.connect());
    AsyncMessageChannel.ReactInstance.handle(AsyncMessageTypes.GET_THEME_INFO, mockGetThemeInfoHandler);
    runAfter.push(AsyncMessageChannel.PluginInstance.connect());
  });

  afterAll(() => {
    runAfter.forEach((fn) => fn());
  });

  beforeEach(() => {
    mockGenerate.mockClear();
    mockGetLocalVariableCollections.mockImplementation(() => []);
    mockGetLocalVariableCollectionsAsync.mockImplementation(async () => []);
    mockCreateVariableCollection.mockImplementation((name: string) => {
      const collection = {
        id: `VariableCollectionId:${name}`,
        name,
        modes: [{ name: 'Mode 1', modeId: `${name}-mode-1` }],
        addMode: jest.fn((modeName: string) => {
          const modeId = `${name}-${modeName}`;
          collection.modes.push({ name: modeName, modeId });
          return modeId;
        }),
        renameMode: jest.fn((modeId: string, modeName: string) => {
          const mode = collection.modes.find((m) => m.modeId === modeId);
          if (mode) mode.name = modeName;
        }),
      };
      return collection;
    });
  });

  const tokens = {
    'brand/a': [{ name: 'brand.accent', value: '#2143a2', type: TokenTypes.COLOR } as SingleToken],
    'brand/b': [{ name: 'brand.accent', value: '#2754ac', type: TokenTypes.COLOR } as SingleToken],
    charts: [{ name: 'chart.default', value: '{brand.accent}', type: TokenTypes.COLOR } as SingleToken],
  };
  const settings = { baseFontSize: '16', variablesColor: true } as SettingsState;

  it('resolves the charts theme against the active brand only', async () => {
    await createLocalVariablesInPlugin(tokens, settings, ['a', 'b', 'charts']);

    const chartsCalls = mockGenerate.mock.calls.filter(([arg]) => arg.theme.id === 'charts');
    expect(chartsCalls.length).toBeGreaterThan(0);
    chartsCalls.forEach(([arg]) => {
      expect(arg.overallConfig).toEqual({
        'brand/a': TokenSetStatus.ENABLED,
        charts: TokenSetStatus.ENABLED,
      });
    });
  });

  it('resolves each brand theme against its own sets only', async () => {
    await createLocalVariablesInPlugin(tokens, settings, ['a', 'b', 'charts']);

    const brandBCalls = mockGenerate.mock.calls.filter(([arg]) => arg.theme.id === 'b');
    expect(brandBCalls.length).toBeGreaterThan(0);
    brandBCalls.forEach(([arg]) => {
      expect(arg.overallConfig).toEqual({
        'brand/b': TokenSetStatus.ENABLED,
        charts: TokenSetStatus.ENABLED,
      });
    });
  });
});

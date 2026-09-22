// Regression guard for the multi-mode variable export bug: when a per-theme
// server-resolved delta is passed to createLocalVariablesInPlugin, each call
// to generateTokensToCreate inside the export loop must receive ITS OWN
// theme's slice, not a shared map. This test lives at the plugin-loop layer
// because that is where the slicing (`deltaFor(...)`) is actually performed —
// the earlier test in generateTokensToCreate.test.ts only proves the leaf
// helper applies whatever delta the caller supplies, not that the caller
// slices correctly.

import { mockCreateVariableCollection, mockGetLocalVariableCollections, mockGetLocalVariableCollectionsAsync } from '../../tests/__mocks__/figmaMock';
import { AsyncMessageTypes, GetThemeInfoMessageResult } from '@/types/AsyncMessages';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { TokenTypes } from '@/constants/TokenTypes';
import { SettingsState } from '@/app/store/models/settings';
import { SingleToken } from '@/types/tokens';

// Mock BEFORE importing the module under test so the mock replaces the real
// generateTokensToCreate that createLocalVariablesInPlugin closes over.
jest.mock('./generateTokensToCreate', () => ({
  generateTokensToCreate: jest.fn(() => ({ tokensToCreate: [], resolvedTokens: [] })),
}));

// eslint-disable-next-line import/first
import createLocalVariablesInPlugin from './createLocalVariablesInPlugin';
// eslint-disable-next-line import/first
import { generateTokensToCreate } from './generateTokensToCreate';

const mockGenerate = generateTokensToCreate as jest.MockedFunction<typeof generateTokensToCreate>;

describe('createLocalVariablesInPlugin — per-theme serverResolvedTokens slicing', () => {
  const runAfter: (() => void)[] = [];

  const themes = [
    {
      id: 'light',
      name: 'light',
      group: 'color',
      selectedTokenSets: { global: TokenSetStatus.ENABLED },
      $figmaStyleReferences: {},
    },
    {
      id: 'dark',
      name: 'dark',
      group: 'color',
      selectedTokenSets: { global: TokenSetStatus.ENABLED },
      $figmaStyleReferences: {},
    },
  ];

  const mockGetThemeInfoHandler = async (): Promise<GetThemeInfoMessageResult> => ({
    type: AsyncMessageTypes.GET_THEME_INFO,
    activeTheme: { color: 'light' },
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
    // Same collection reference reused across themes — findCollectionAndModeIdForTheme
    // then finds it by group name for each theme and adds a second mode.
    const collection = {
      id: 'VariableCollectionId:1',
      name: 'color',
      modes: [{ name: 'light', modeId: 'light-mode' }],
      addMode: jest.fn(() => {
        (collection.modes as { name: string; modeId: string }[]).push({ name: 'dark', modeId: 'dark-mode' });
        return 'dark-mode';
      }),
      renameMode: jest.fn(),
    };
    mockCreateVariableCollection.mockImplementation(() => collection);
  });

  const tokens = {
    global: [{ name: 'color.bg', value: '#local', type: TokenTypes.COLOR } as SingleToken],
  };
  const settings = { baseFontSize: '16', variablesColor: true } as SettingsState;

  it('passes ONLY that theme\'s slice of serverResolvedTokens to each per-theme call', async () => {
    const perThemeDelta = {
      light: { 'color.bg': '#ffffff' },
      dark: { 'color.bg': '#000000' },
    };

    await createLocalVariablesInPlugin(tokens, settings, ['light', 'dark'], perThemeDelta);

    // Collect the (themeId → serverResolvedTokens) pairs the plugin passed to
    // generateTokensToCreate. Any call that got the WHOLE per-theme map (the
    // pre-fix bug) or that got the WRONG theme's slice fails this assertion.
    const passedByTheme = new Map<string, unknown>();
    for (const call of mockGenerate.mock.calls) {
      const arg = call[0];
      passedByTheme.set(arg.theme.id, arg.serverResolvedTokens);
    }

    expect(passedByTheme.get('light')).toEqual({ 'color.bg': '#ffffff' });
    expect(passedByTheme.get('dark')).toEqual({ 'color.bg': '#000000' });
    // Not the whole map (that would be the pre-fix bug shape)
    expect(passedByTheme.get('light')).not.toEqual(perThemeDelta);
    expect(passedByTheme.get('dark')).not.toEqual(perThemeDelta);
  });

  it('passes null to generateTokensToCreate for a theme absent from the delta map', async () => {
    // Simulate a case where the server resolved only some themes (or the
    // caller passed a sparse map): the plugin must NOT fall back to another
    // theme's delta — that's the exact clobber the fix prevents.
    const partialDelta = { light: { 'color.bg': '#ffffff' } };

    await createLocalVariablesInPlugin(tokens, settings, ['light', 'dark'], partialDelta);

    const darkCall = mockGenerate.mock.calls.find(([arg]) => arg.theme.id === 'dark');
    expect(darkCall?.[0].serverResolvedTokens).toBeNull();
  });

  it('passes null to every theme when serverResolvedTokens is null', async () => {
    await createLocalVariablesInPlugin(tokens, settings, ['light', 'dark'], null);

    for (const [arg] of mockGenerate.mock.calls) {
      expect(arg.serverResolvedTokens).toBeNull();
    }
  });
});

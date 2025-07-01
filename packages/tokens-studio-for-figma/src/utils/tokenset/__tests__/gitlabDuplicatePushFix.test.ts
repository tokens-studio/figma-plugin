import { TokenState } from '@/app/store/models/tokenState';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { updateTokenSetsInState } from '@/utils/tokenset/updateTokenSetsInState';
import { setActiveTheme } from '@/app/store/models/reducers/tokenState/setActiveTheme';

describe('GitLab duplicate push fix', () => {
  let mockInitialState: TokenState;

  beforeEach(() => {
    // Simulate the initial state with existing token sets and themes
    mockInitialState = {
      tokens: {
        global: [{ name: 'primary', value: '#000' }],
        colors: [{ name: 'secondary', value: '#fff' }],
      },
      usedTokenSet: {
        global: TokenSetStatus.ENABLED,
        colors: TokenSetStatus.SOURCE,
      },
      themes: [
        {
          id: 'lightTheme',
          name: 'Light Theme',
          selectedTokenSets: {
            global: TokenSetStatus.ENABLED,
            colors: TokenSetStatus.SOURCE,
          },
        },
        {
          id: 'darkTheme',
          name: 'Dark Theme',
          selectedTokenSets: {
            global: TokenSetStatus.ENABLED,
            // Note: colors is not included in dark theme initially
          },
        },
      ],
      activeTokenSet: 'global',
      // Add other required properties
      stringTokens: '',
      lastSyncedState: '',
      importedTokens: { newTokens: [], updatedTokens: [] },
      activeTheme: { group: 'lightTheme' },
      editProhibited: false,
      hasUnsavedChanges: false,
      collapsedTokenSets: [],
      collapsedTokenTypeObj: {} as any,
      checkForChanges: false,
      collapsedTokens: [],
      changedState: { tokens: {}, themes: [], metadata: null },
      remoteData: { tokens: {}, themes: [], metadata: null },
      tokenFormat: 'standard' as any,
      tokenSetMetadata: {},
      importedThemes: { newThemes: [], updatedThemes: [] },
      compressedTokens: '',
      compressedThemes: '',
      tokensSize: 0,
      themesSize: 0,
    } as TokenState;
  });

  it('should prevent duplicate GitLab pushes when creating and using new token sets', () => {
    // Step 1: User creates a new token set
    const stateAfterCreation = updateTokenSetsInState(
      mockInitialState,
      null,
      ['newSpacingSet', [{ name: 'spacing.small', value: '8px' }]],
    );

    // Verify the new token set is created
    expect(stateAfterCreation.tokens.newSpacingSet).toEqual([
      { name: 'spacing.small', value: '8px' },
    ]);

    // Verify the new token set is DISABLED in global usedTokenSet (for backward compatibility)
    expect(stateAfterCreation.usedTokenSet.newSpacingSet).toBe(TokenSetStatus.DISABLED);

    // Critical fix: The new token set should NOT be automatically added to existing themes
    expect(stateAfterCreation.themes[0].selectedTokenSets).not.toHaveProperty('newSpacingSet');
    expect(stateAfterCreation.themes[1].selectedTokenSets).not.toHaveProperty('newSpacingSet');

    // Step 2: User explicitly adds the new token set to specific themes (simulating UI interaction)
    const stateAfterThemeConfiguration: TokenState = {
      ...stateAfterCreation,
      themes: stateAfterCreation.themes.map((theme) => {
        if (theme.id === 'lightTheme') {
          // User enables the new token set in light theme
          return {
            ...theme,
            selectedTokenSets: {
              ...theme.selectedTokenSets,
              newSpacingSet: TokenSetStatus.ENABLED,
            },
          };
        }
        if (theme.id === 'darkTheme') {
          // User enables the new token set in dark theme as SOURCE
          return {
            ...theme,
            selectedTokenSets: {
              ...theme.selectedTokenSets,
              newSpacingSet: TokenSetStatus.SOURCE,
            },
          };
        }
        return theme;
      }),
    };

    // Step 3: Activate a theme to update usedTokenSet properly
    const finalState = setActiveTheme(stateAfterThemeConfiguration, {
      newActiveTheme: { group: 'lightTheme' },
    });

    // Verify the active theme configuration is correct
    expect(finalState.activeTheme).toEqual({ group: 'lightTheme' });

    // Verify usedTokenSet reflects the active theme configuration
    expect(finalState.usedTokenSet.global).toBe(TokenSetStatus.ENABLED);
    expect(finalState.usedTokenSet.colors).toBe(TokenSetStatus.SOURCE);
    expect(finalState.usedTokenSet.newSpacingSet).toBe(TokenSetStatus.ENABLED);

    // Verify themes have the correct configuration
    expect(finalState.themes[0].selectedTokenSets.newSpacingSet).toBe(TokenSetStatus.ENABLED);
    expect(finalState.themes[1].selectedTokenSets.newSpacingSet).toBe(TokenSetStatus.SOURCE);

    // This state can now be synced to GitLab in a single push with the correct configuration
    // No duplicate push needed because the new token set was never incorrectly marked as DISABLED in themes
  });

  it('should maintain existing token set configurations when adding new ones', () => {
    const stateAfterCreation = updateTokenSetsInState(
      mockInitialState,
      null,
      ['typography', [{ name: 'font.size', value: '16px' }]],
    );

    // Existing configurations should be preserved
    expect(stateAfterCreation.themes[0].selectedTokenSets.global).toBe(TokenSetStatus.ENABLED);
    expect(stateAfterCreation.themes[0].selectedTokenSets.colors).toBe(TokenSetStatus.SOURCE);
    expect(stateAfterCreation.themes[1].selectedTokenSets.global).toBe(TokenSetStatus.ENABLED);
    expect(stateAfterCreation.themes[1].selectedTokenSets.colors).toBeUndefined();

    // New token set should not pollute existing themes
    expect(stateAfterCreation.themes[0].selectedTokenSets).not.toHaveProperty('typography');
    expect(stateAfterCreation.themes[1].selectedTokenSets).not.toHaveProperty('typography');
  });
});

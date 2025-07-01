import { TokenState } from '@/app/store/models/tokenState';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { updateTokenSetsInState } from '@/utils/tokenset/updateTokenSetsInState';
import { setActiveTheme } from '@/app/store/models/reducers/tokenState/setActiveTheme';

describe('GitLab sync workflow integration test', () => {
  /**
   * This test simulates the complete workflow that would previously cause duplicate GitLab pushes:
   * 1. User creates a new token set
   * 2. User adds the token set to specific themes with enabled status
   * 3. System syncs to GitLab
   *
   * Before the fix: First sync would include incorrect DISABLED status, requiring a second sync
   * After the fix: Single sync with correct configuration
   */
  it('should enable single-push GitLab sync for new token sets added to themes', () => {
    // Initial state: Existing tokens and themes
    const initialState: TokenState = {
      tokens: {
        global: [{ name: 'primary-color', value: '#007AFF' }],
        spacing: [{ name: 'base', value: '16px' }],
      },
      usedTokenSet: {
        global: TokenSetStatus.ENABLED,
        spacing: TokenSetStatus.SOURCE,
      },
      themes: [
        {
          id: 'light-theme',
          name: 'Light Theme',
          selectedTokenSets: {
            global: TokenSetStatus.ENABLED,
            spacing: TokenSetStatus.SOURCE,
          },
        },
        {
          id: 'dark-theme',
          name: 'Dark Theme',
          selectedTokenSets: {
            global: TokenSetStatus.ENABLED,
            // spacing is not used in dark theme
          },
        },
      ],
      activeTheme: { mode: 'light-theme' },
      activeTokenSet: 'global',
      // Mock other required properties
      stringTokens: '',
      lastSyncedState: '',
      importedTokens: { newTokens: [], updatedTokens: [] },
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

    // Step 1: User creates a new "typography" token set
    const stateWithNewTokenSet = updateTokenSetsInState(
      initialState,
      null,
      ['typography', [
        { name: 'heading.large', value: '24px' },
        { name: 'body.regular', value: '16px' },
      ]],
    );

    // Verify the new token set exists but is not added to existing themes
    expect(stateWithNewTokenSet.tokens.typography).toEqual([
      { name: 'heading.large', value: '24px' },
      { name: 'body.regular', value: '16px' },
    ]);
    expect(stateWithNewTokenSet.usedTokenSet.typography).toBe(TokenSetStatus.DISABLED);

    // CRITICAL: New token set should NOT be in existing themes (this was the bug)
    expect(stateWithNewTokenSet.themes[0].selectedTokenSets).not.toHaveProperty('typography');
    expect(stateWithNewTokenSet.themes[1].selectedTokenSets).not.toHaveProperty('typography');

    // Step 2: User configures the new token set in specific themes via UI
    const stateWithConfiguredThemes: TokenState = {
      ...stateWithNewTokenSet,
      themes: stateWithNewTokenSet.themes.map((theme) => {
        if (theme.id === 'light-theme') {
          // User enables typography in light theme
          return {
            ...theme,
            selectedTokenSets: {
              ...theme.selectedTokenSets,
              typography: TokenSetStatus.ENABLED,
            },
          };
        }
        if (theme.id === 'dark-theme') {
          // User enables typography as SOURCE in dark theme
          return {
            ...theme,
            selectedTokenSets: {
              ...theme.selectedTokenSets,
              typography: TokenSetStatus.SOURCE,
            },
          };
        }
        return theme;
      }),
    };

    // Step 3: User activates a theme, which updates usedTokenSet
    const finalState = setActiveTheme(stateWithConfiguredThemes, {
      newActiveTheme: { mode: 'light-theme' },
    });

    // Step 4: Verify the state is ready for a SINGLE GitLab sync

    // Active theme should be set correctly
    expect(finalState.activeTheme).toEqual({ mode: 'light-theme' });

    // usedTokenSet should reflect the active theme's configuration
    expect(finalState.usedTokenSet).toEqual({
      global: TokenSetStatus.ENABLED,
      spacing: TokenSetStatus.SOURCE,
      typography: TokenSetStatus.ENABLED, // From active light theme
    });

    // Themes should have the user-configured token set statuses
    expect(finalState.themes[0].selectedTokenSets).toEqual({
      global: TokenSetStatus.ENABLED,
      spacing: TokenSetStatus.SOURCE,
      typography: TokenSetStatus.ENABLED,
    });

    expect(finalState.themes[1].selectedTokenSets).toEqual({
      global: TokenSetStatus.ENABLED,
      typography: TokenSetStatus.SOURCE,
    });

    // This state can now be synced to GitLab in a SINGLE push
    // The themes data will correctly reflect the user's intent
    // No duplicate push needed because typography was never incorrectly marked as DISABLED in themes

    // Simulate what GitLab sync would send (this is what goes in the push)
    const gitlabSyncData = {
      tokens: finalState.tokens,
      themes: finalState.themes,
      metadata: { tokenSetOrder: Object.keys(finalState.tokens) },
    };

    // Verify the sync data has correct theme configurations
    expect(gitlabSyncData.themes[0].selectedTokenSets.typography).toBe(TokenSetStatus.ENABLED);
    expect(gitlabSyncData.themes[1].selectedTokenSets.typography).toBe(TokenSetStatus.SOURCE);

    // No DISABLED status for typography in themes - this prevents the duplicate push bug
    Object.values(gitlabSyncData.themes).forEach((theme) => {
      if ('typography' in theme.selectedTokenSets) {
        expect(theme.selectedTokenSets.typography).not.toBe(TokenSetStatus.DISABLED);
      }
    });
  });

  it('should maintain backward compatibility for existing token set management', () => {
    const state: TokenState = {
      tokens: { global: [] },
      usedTokenSet: { global: TokenSetStatus.ENABLED },
      themes: [{
        id: 'theme1',
        name: 'Theme 1',
        selectedTokenSets: { global: TokenSetStatus.ENABLED },
      }],
      activeTheme: { group: 'theme1' },
      activeTokenSet: 'global',
    } as any;

    // Adding a token set still works as expected
    const result = updateTokenSetsInState(state, null, ['newSet']);

    expect(result.tokens.newSet).toEqual([]);
    expect(result.usedTokenSet.newSet).toBe(TokenSetStatus.DISABLED);

    // But it doesn't pollute existing themes
    expect(result.themes[0].selectedTokenSets).not.toHaveProperty('newSet');
  });
});

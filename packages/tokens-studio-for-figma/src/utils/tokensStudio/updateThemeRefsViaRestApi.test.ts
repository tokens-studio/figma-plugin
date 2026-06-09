import { updateThemeRefsViaRestApi, snapshotThemeRefs } from './updateThemeRefsViaRestApi';

// Mock dependencies
jest.mock('@/app/store/useAuthStore', () => ({
  useAuthStore: {
    getState: jest.fn(),
  },
}));

jest.mock('@/app/services/OAuthService', () => ({
  OAuthService: {
    getApiBaseUrl: jest.fn(() => 'https://api.studio.example.com'),
  },
}));

jest.mock('@/constants/TokensStudio', () => ({
  TOKENS_STUDIO_APP_URL: 'https://studio.example.com',
}));

jest.mock('./fetchBranchesListRest', () => ({
  resolveChangeSetId: jest.fn(),
}));

jest.mock('./pushThemeRefsRest', () => ({
  patchThemeGroupVariableRefs: jest.fn(),
  patchThemeOptionStyleRefs: jest.fn(),
}));

import { useAuthStore } from '@/app/store/useAuthStore';
import { resolveChangeSetId } from './fetchBranchesListRest';
import { patchThemeGroupVariableRefs, patchThemeOptionStyleRefs } from './pushThemeRefsRest';

describe('updateThemeRefsViaRestApi', () => {
  const mockGetState = useAuthStore.getState as jest.Mock;
  const mockResolveChangeSetId = resolveChangeSetId as jest.Mock;
  const mockPatchGroup = patchThemeGroupVariableRefs as jest.Mock;
  const mockPatchOption = patchThemeOptionStyleRefs as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetState.mockReturnValue({
      oauthTokens: { accessToken: 'test-token' },
    });
    mockResolveChangeSetId.mockResolvedValue('cs-789');
    mockPatchGroup.mockResolvedValue(undefined);
    mockPatchOption.mockResolvedValue(undefined);
  });

  const makeRootState = (themes: any[], api?: any) => ({
    tokenState: { themes },
    uiState: { api: api || { provider: 'tokensstudio-oauth', id: 'proj-1', branch: 'main' } },
  });

  it('should not call PATCH when no refs changed', async () => {
    const themes = [{
      id: 'opt-1',
      name: 'Light',
      $themeGroupId: 'grp-1',
      $themeOptionId: 'opt-1',
      $figmaVariableReferences: { 'color.bg': 'VarID:1:1' },
      $figmaStyleReferences: { 'text.body': 'S:abc,' },
    }];

    await updateThemeRefsViaRestApi({
      prevThemeRefs: snapshotThemeRefs(themes as any),
      rootState: makeRootState(themes) as any,
    });

    expect(mockPatchGroup).not.toHaveBeenCalled();
    expect(mockPatchOption).not.toHaveBeenCalled();
  });

  it('should PATCH variable refs when they change (group-level)', async () => {
    const prevThemes = [{
      id: 'opt-1',
      name: 'Light',
      $themeGroupId: 'grp-1',
      $themeOptionId: 'opt-1',
      $figmaVariableReferences: { 'color.bg': 'VarID:1:1' },
    }];
    const nextThemes = [{
      id: 'opt-1',
      name: 'Light',
      $themeGroupId: 'grp-1',
      $themeOptionId: 'opt-1',
      $figmaVariableReferences: { 'color.bg': 'VarID:1:1', 'color.fg': 'VarID:2:2' },
    }];

    await updateThemeRefsViaRestApi({
      prevThemeRefs: snapshotThemeRefs(prevThemes as any),
      rootState: makeRootState(nextThemes) as any,
    });

    expect(mockPatchGroup).toHaveBeenCalledWith(
      'test-token',
      'https://api.studio.example.com',
      'proj-1',
      'cs-789',
      'grp-1',
      { 'color.bg': 'VarID:1:1', 'color.fg': 'VarID:2:2' },
    );
  });

  it('should PATCH style refs when they change (option-level)', async () => {
    const prevThemes = [{
      id: 'opt-1',
      name: 'Light',
      $themeGroupId: 'grp-1',
      $themeOptionId: 'opt-1',
      $figmaStyleReferences: { 'text.body': 'S:abc,' },
    }];
    const nextThemes = [{
      id: 'opt-1',
      name: 'Light',
      $themeGroupId: 'grp-1',
      $themeOptionId: 'opt-1',
      $figmaStyleReferences: { 'text.body': 'S:abc,', 'text.heading': 'S:def,' },
    }];

    await updateThemeRefsViaRestApi({
      prevThemeRefs: snapshotThemeRefs(prevThemes as any),
      rootState: makeRootState(nextThemes) as any,
    });

    expect(mockPatchOption).toHaveBeenCalledWith(
      'test-token',
      'https://api.studio.example.com',
      'proj-1',
      'cs-789',
      'opt-1',
      { 'text.body': 'S:abc,', 'text.heading': 'S:def,' },
    );
  });

  it('should only PATCH group once even if multiple options share it', async () => {
    const prevThemes = [
      { id: 'opt-1', name: 'Light', $themeGroupId: 'grp-1', $themeOptionId: 'opt-1', $figmaVariableReferences: {} },
      { id: 'opt-2', name: 'Dark', $themeGroupId: 'grp-1', $themeOptionId: 'opt-2', $figmaVariableReferences: {} },
    ];
    const nextThemes = [
      { id: 'opt-1', name: 'Light', $themeGroupId: 'grp-1', $themeOptionId: 'opt-1', $figmaVariableReferences: { 'x': 'y' } },
      { id: 'opt-2', name: 'Dark', $themeGroupId: 'grp-1', $themeOptionId: 'opt-2', $figmaVariableReferences: { 'x': 'y' } },
    ];

    await updateThemeRefsViaRestApi({
      prevThemeRefs: snapshotThemeRefs(prevThemes as any),
      rootState: makeRootState(nextThemes) as any,
    });

    expect(mockPatchGroup).toHaveBeenCalledTimes(1);
  });

  it('should abort if no OAuth token', async () => {
    mockGetState.mockReturnValue({ oauthTokens: null });

    await updateThemeRefsViaRestApi({
      prevThemeRefs: new Map(),
      rootState: makeRootState([]) as any,
    });

    expect(mockResolveChangeSetId).not.toHaveBeenCalled();
  });

  it('should abort if changeSetId cannot be resolved', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();
    mockResolveChangeSetId.mockResolvedValue(null);

    const themes = [{
      id: 'opt-1', $themeGroupId: 'grp-1', $themeOptionId: 'opt-1',
      $figmaVariableReferences: { a: 'b' },
    }];

    await updateThemeRefsViaRestApi({
      prevThemeRefs: snapshotThemeRefs([{ id: 'opt-1', $themeGroupId: 'grp-1', $themeOptionId: 'opt-1' }] as any),
      rootState: makeRootState(themes) as any,
    });

    expect(mockPatchGroup).not.toHaveBeenCalled();
    expect(mockPatchOption).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should correctly detect changes even when refs are mutated in-place by utilizing snapshots', async () => {
    // Simulate what the current reducers do: mutate refs in-place
    const sharedVarRefs = { 'color.old': 'VarID:1' };
    
    const themesBeforeMutation = [{
      id: 'light',
      $themeGroupId: 'grp-1',
      $themeOptionId: 'opt-1',
      $figmaVariableReferences: sharedVarRefs,
    }];

    // Capture snapshot BEFORE the mutation
    const prevThemeRefs = snapshotThemeRefs(themesBeforeMutation as any);

    // Now mutate in-place (simulating the reducer)
    sharedVarRefs['color.new'] = 'VarID:1';
    delete sharedVarRefs['color.old'];

    // nextState themes point to the mutated sharedVarRefs object
    const nextThemes = [{
      id: 'light',
      $themeGroupId: 'grp-1',
      $themeOptionId: 'opt-1',
      $figmaVariableReferences: sharedVarRefs,
    }];

    await updateThemeRefsViaRestApi({
      prevThemeRefs,
      rootState: makeRootState(nextThemes) as any,
    });

    // The diff should succeed because it compares against the snapshot
    expect(mockPatchGroup).toHaveBeenCalledWith(
      'test-token',
      'https://api.studio.example.com',
      'proj-1',
      'cs-789',
      'grp-1',
      { 'color.new': 'VarID:1' },
    );
  });
});

import { init, RematchStore } from '@rematch/core';
import { RootModel } from '@/types/RootModel';
import { models } from './index';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { track } from '@/utils/analytics';

jest.mock('@/utils/analytics', () => ({
  track: jest.fn(),
}));

type Store = RematchStore<RootModel, Record<string, never>>;

describe('uiState', () => {
  let store: Store;
  beforeEach(() => {
    store = init<RootModel>({
      redux: {
        initialState: {
          activeTokensTab: 'list',
          figmaFonts: [],
        },
      },
      models,
    });
  });

  it('should be able to set inspectDeep', () => {
    const fonts = [
      {
        fontName: {
          family: 'ABeeZee',
          style: 'Italic',
        },
      },
      {
        fontName: {
          family: 'Abril Fatface',
          style: 'Regular',
        },
      },
    ];
    store.dispatch.uiState.setFigmaFonts(fonts);
    expect(store.getState().uiState.figmaFonts).toBe(fonts);
  });

  it('applies a whole selection update at once', () => {
    store.dispatch.uiState.setSelection({
      selectedLayers: 2,
      disabled: false,
      mainNodeSelectionValues: { fill: 'color.brand' },
      selectionValues: [{
        category: 'fill', type: 'fill', value: 'color.brand', nodes: [],
      }] as any,
    });
    expect(store.getState().uiState).toEqual(expect.objectContaining({
      selectedLayers: 2,
      disabled: false,
      mainNodeSelectionValues: { fill: 'color.brand' },
      selectionValues: [{
        category: 'fill', type: 'fill', value: 'color.brand', nodes: [],
      }],
    }));
  });

  it('counts job tasks as they are added and completed', () => {
    const name = BackgroundJobs.UI_APPLYNODEVALUE;
    store.dispatch.uiState.startJob({ name });
    store.dispatch.uiState.startJob({ name: BackgroundJobs.UI_DELETETOKEN });

    store.dispatch.uiState.addJobTasks({ name, count: 4, expectedTimePerTask: 50 });
    store.dispatch.uiState.addJobTasks({ name, count: 2 });
    store.dispatch.uiState.completeJobTasks({ name, count: 3, timePerTask: 40 });
    store.dispatch.uiState.completeJobTasks({ name, count: 1 });

    const [job, other] = store.getState().uiState.backgroundJobs;
    expect(job).toEqual(expect.objectContaining({
      name, totalTasks: 6, completedTasks: 4, timePerTask: 40,
    }));
    expect(other).toEqual({ name: BackgroundJobs.UI_DELETETOKEN });

    store.dispatch.uiState.completeJob(name);
    expect(store.getState().uiState.backgroundJobs).toEqual([other]);
    store.dispatch.uiState.clearJobs();
    expect(store.getState().uiState.backgroundJobs).toEqual([]);
  });

  it('completes tasks for a job that never announced its total', () => {
    const name = BackgroundJobs.UI_APPLYNODEVALUE;
    store.dispatch.uiState.startJob({ name });
    store.dispatch.uiState.completeJobTasks({ name, count: 2 });
    expect(store.getState().uiState.backgroundJobs[0]).toEqual(expect.objectContaining({ completedTasks: 2, totalTasks: 2 }));
  });

  it('sets simple ui flags and values', () => {
    const { uiState } = store.dispatch;
    uiState.setShowConvertTokenFormatModal(true);
    uiState.setDisplayType('LIST');
    uiState.setActiveTokensTab('json');
    uiState.setProjectURL('https://example.com/project');
    uiState.setTokenFilter('brand');
    uiState.toggleCollapsed();
    uiState.setManageThemesModalOpen(true);
    uiState.setSidebarWidth(320);
    uiState.setShowBitbucketMigrationDialog(true);
    uiState.setTriggerMigrationEdit({ id: 'bitbucket' });
    uiState.setScrollPositionSet({ global: 120 });
    uiState.toggleSecondScreen();
    uiState.setShowAutoSuggest(true);

    expect(store.getState().uiState).toEqual(expect.objectContaining({
      showConvertTokenFormatModal: true,
      displayType: 'LIST',
      activeTokensTab: 'json',
      projectURL: 'https://example.com/project',
      tokenFilter: 'brand',
      collapsed: true,
      manageThemesModalOpen: true,
      sidebarWidth: 320,
      showBitbucketMigrationDialog: true,
      triggerMigrationEdit: { id: 'bitbucket' },
      scrollPositionSet: { global: 120 },
      secondScreenEnabled: true,
      showAutoSuggest: true,
    }));
    expect(track).toHaveBeenCalledWith('setDisplayType', { type: 'LIST' });
  });

  it('toggles empty groups and deprecated tokens, and tells the plugin', () => {
    const message = jest.spyOn(AsyncMessageChannel.ReactInstance, 'message').mockResolvedValue(undefined as any);
    const { showEmptyGroups, hideDeprecatedTokens } = store.getState().uiState;

    store.dispatch.uiState.toggleShowEmptyGroups(null);
    store.dispatch.uiState.toggleHideDeprecatedTokens(null);
    expect(store.getState().uiState.showEmptyGroups).toBe(!showEmptyGroups);
    expect(store.getState().uiState.hideDeprecatedTokens).toBe(!hideDeprecatedTokens);
    expect(message).toHaveBeenCalledWith({ type: AsyncMessageTypes.SET_SHOW_EMPTY_GROUPS, showEmptyGroups: !showEmptyGroups });
    expect(message).toHaveBeenCalledWith({ type: AsyncMessageTypes.SET_HIDE_DEPRECATED_TOKENS, hideDeprecatedTokens: !hideDeprecatedTokens });

    store.dispatch.uiState.toggleShowEmptyGroups(true);
    store.dispatch.uiState.toggleHideDeprecatedTokens(false);
    expect(store.getState().uiState.showEmptyGroups).toBe(true);
    expect(store.getState().uiState.hideDeprecatedTokens).toBe(false);
    expect(message).toHaveBeenCalledWith({ type: AsyncMessageTypes.SET_SHOW_EMPTY_GROUPS, showEmptyGroups: true });
    expect(message).toHaveBeenCalledWith({ type: AsyncMessageTypes.SET_HIDE_DEPRECATED_TOKENS, hideDeprecatedTokens: false });
    message.mockRestore();
  });

  it('tells the plugin about onboarding and export theme changes', () => {
    const message = jest.spyOn(AsyncMessageChannel.ReactInstance, 'message').mockResolvedValue(undefined as any);
    const { uiState } = store.dispatch;
    uiState.setOnboardingExplainerSets(false);
    uiState.setOnboardingExplainerExportSets(false);
    uiState.setOnboardingExplainerSyncProviders(false);
    uiState.setOnboardingExplainerInspect(false);
    uiState.setSelectedExportThemes(['light']);

    expect(message).toHaveBeenCalledWith({ type: AsyncMessageTypes.SET_ONBOARDINGEXPLAINERSETS, onboardingExplainerSets: false });
    expect(message).toHaveBeenCalledWith({ type: AsyncMessageTypes.SET_ONBOARDINGEXPLAINEREXPORTSETS, onboardingExplainerExportSets: false });
    expect(message).toHaveBeenCalledWith({ type: AsyncMessageTypes.SET_ONBOARDINGEXPLAINERSYNCPROVIDERS, onboardingExplainerSyncProviders: false });
    expect(message).toHaveBeenCalledWith({ type: AsyncMessageTypes.SET_ONBOARDINGEXPLAINERINSPECT, onboardingExplainerInspect: false });
    expect(message).toHaveBeenCalledWith({ type: AsyncMessageTypes.SET_SELECTED_EXPORT_THEMES, themes: JSON.stringify(['light']) });
    message.mockRestore();
  });
});

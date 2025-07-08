/* eslint-disable import/prefer-default-export */
import { createModel } from '@rematch/core';
import { track } from '@/utils/analytics';
import type { RootModel } from '@/types/RootModel';
import fetchChangelog from '@/utils/storyblok';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { SelectionGroup, StoryblokStory } from '@/types';
import { Tabs } from '@/constants/Tabs';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { StorageType, StorageTypeCredentials, StorageTypeFormValues } from '@/types/StorageType';
import { EditTokenObject } from '@/types/tokens';
import { TokenTypes } from '@/constants/TokenTypes';
import { EditTokenFormStatus } from '@/constants/EditTokenFormStatus';
import { TokenFormatOptions } from '@/plugin/TokenFormatStoreClass';
import { PushOverrides } from '../remoteTokens';

type DisplayType = 'GRID' | 'LIST';

type SelectionValue = NodeTokenRefMap;

export type ConfirmProps = {
  show?: boolean;
  text?: string;
  description?: React.ReactNode;
  choices?: { key: string; label: string; enabled?: boolean, unique?: boolean }[];
  confirmAction?: string;
  cancelAction?: string;
  variant?: 'danger';
  input?: {
    type: 'text';
    placeholder: string;
  };
  formId?: string;
};

export type AddJobTasksPayload = {
  name: string;
  count: number;
  expectedTimePerTask?: number;
};

export type CompleteJobTasksPayload = {
  name: string;
  count: number;
  timePerTask?: number;
};

export type BackgroundJob = {
  name: string;
  isInfinite?: boolean;
  timePerTask?: number;
  completedTasks?: number;
  totalTasks?: number;
};
export interface UIState {
  backgroundJobs: BackgroundJob[]
  selectionValues: SelectionGroup[];
  mainNodeSelectionValues: SelectionValue
  displayType: DisplayType;
  disabled: boolean;
  activeTab: Tabs;
  activeTokensTab: 'list' | 'json';
  projectURL: string;
  storageType: StorageType;
  api: StorageTypeCredentials;
  apiProviders: StorageTypeCredentials[];
  localApiState: StorageTypeFormValues<true>;
  lastUpdatedAt: string | null;
  changelog: StoryblokStory['content'][];
  lastOpened: number | null;
  onboardingExplainerSets: boolean;
  onboardingExplainerExportSets: boolean;
  onboardingExplainerSyncProviders: boolean;
  onboardingExplainerInspect: boolean;
  editToken: EditTokenObject;
  showEditForm: boolean;
  tokenFilter: string;
  confirmState: ConfirmProps;
  showPushDialog: { state: string | false, overrides?: PushOverrides };
  showPullDialog: string | false;
  showEmptyGroups: boolean;
  collapsed: boolean;
  selectedLayers: number;
  manageThemesModalOpen: boolean;
  scrollPositionSet: Record<string, number>;
  figmaFonts: Font[]
  secondScreenEnabled: boolean;
  showAutoSuggest: boolean;
  showConvertTokenFormatModal: boolean;
  sidebarWidth: number;
  hasRemoteChange: boolean;
  selectedExportThemes?: string[];
}

const defaultConfirmState: ConfirmProps = {
  show: false,
  text: '',
  description: '',
  choices: undefined,
  confirmAction: 'Yes',
  cancelAction: 'Cancel',
  input: undefined,
};

export const uiState = createModel<RootModel>()({
  state: {
    selectionValues: [] as SelectionGroup[],
    mainNodeSelectionValues: {} as SelectionValue,
    disabled: false,
    displayType: 'GRID',
    backgroundJobs: [],
    activeTab: Tabs.LOADING,
    activeTokensTab: 'list',
    projectURL: '',
    storageType: {
      provider: StorageProviderType.LOCAL,
    },
    api: null,
    apiProviders: [],
    localApiState: {
      provider: StorageProviderType.LOCAL,
      new: false,
      format: TokenFormatOptions.Legacy,
    },
    lastUpdatedAt: null,
    changelog: [],
    lastOpened: '',
    onboardingExplainerSets: null,
    onboardingExplainerExportSets: null,
    onboardingExplainerSyncProviders: null,
    onboardingExplainerInspect: null,
    editToken: {
      type: TokenTypes.OTHER,
      status: EditTokenFormStatus.CREATE,
    },
    showEditForm: false,
    tokenFilter: '',
    tokenFilterVisible: false,
    confirmState: defaultConfirmState,
    showPushDialog: { state: false },
    showPullDialog: false,
    showEmptyGroups: true,
    collapsed: false,
    selectedLayers: 0,
    manageThemesModalOpen: false,
    scrollPositionSet: {},
    figmaFonts: [],
    secondScreenEnabled: false,
    showAutoSuggest: false,
    showConvertTokenFormatModal: false,
    sidebarWidth: 150,
    hasRemoteChange: false,
    selectedExportThemes: [],
  } as unknown as UIState,
  reducers: {
    setShowConvertTokenFormatModal: (state, data: boolean) => ({
      ...state,
      showConvertTokenFormatModal: data,
    }),
    setShowPushDialog: (state, data: { state: string | false, overrides?: PushOverrides }) => ({
      ...state,
      showPushDialog: data,
    }),
    setShowPullDialog: (state, data: string | false) => ({
      ...state,
      showPullDialog: data,
    }),
    setHasRemoteChange: (state, data: boolean) => ({
      ...state,
      hasRemoteChange: data,
    }),
    setShowConfirm: (
      state,
      data: {
        text: string;
        description?: React.ReactNode;
        choices: { key: string; label: string; enabled?: boolean; unique?: boolean }[];
        confirmAction?: string;
        cancelAction?: string;
        variant?: 'danger';
        input?: {
          type: 'text';
          placeholder: string;
        };
        formId?: string;
      },
    ) => ({
      ...state,
      confirmState: {
        show: true,
        text: data.text,
        description: data.description,
        choices: data.choices,
        confirmAction: data.confirmAction || defaultConfirmState.confirmAction,
        cancelAction: data.cancelAction || defaultConfirmState.cancelAction,
        input: data.input,
        variant: data.variant,
        formId: data.formId,
      },
    }),
    setSelectedLayers: (state, data: number) => ({
      ...state,
      selectedLayers: data,
    }),
    setHideConfirm: (state) => ({
      ...state,
      confirmState: defaultConfirmState,
    }),
    setDisabled: (state, data: boolean) => ({
      ...state,
      disabled: data,
    }),
    setEditToken: (state, data: EditTokenObject) => ({
      ...state,
      editToken: data,
    }),
    setShowEditForm: (state, data: boolean) => ({
      ...state,
      showEditForm: data,
    }),
    setDisplayType: (state, data: DisplayType) => {
      track('setDisplayType', { type: data });

      return {
        ...state,
        displayType: data,
      };
    },
    setSelectionValues: (state, data: SelectionGroup[]) => ({
      ...state,
      selectionValues: data,
    }),
    setMainNodeSelectionValues: (state, data: SelectionValue) => ({
      ...state,
      mainNodeSelectionValues: data,
    }),
    resetSelectionValues: (state) => ({
      ...state,
      selectionValues: [] as SelectionGroup[],
    }),
    startJob(state, job: BackgroundJob) {
      return {
        ...state,
        backgroundJobs: [...state.backgroundJobs, { ...job }],
      };
    },
    completeJob(state, name: string) {
      return {
        ...state,
        backgroundJobs: state.backgroundJobs.filter((job) => (
          job.name !== name
        )),
      };
    },
    clearJobs(state) {
      return {
        ...state,
        backgroundJobs: [],
      };
    },
    setActiveTab(state, payload: Tabs) {
      return {
        ...state,
        activeTab: payload,
      };
    },
    setActiveTokensTab(state, payload: 'list' | 'json') {
      return {
        ...state,
        activeTokensTab: payload,
      };
    },
    setProjectURL(state, payload: string) {
      return {
        ...state,
        projectURL: payload,
      };
    },
    setStorage(state, payload: StorageType) {
      return {
        ...state,
        storageType: payload,
      };
    },
    setApiData(state, payload: StorageTypeCredentials) {
      return {
        ...state,
        api: payload,
      };
    },
    setLocalApiState(state, payload: StorageTypeFormValues<true>) {
      return {
        ...state,
        localApiState: payload,
      };
    },
    setAPIProviders(state, payload: StorageTypeCredentials[]) {
      return {
        ...state,
        apiProviders: payload,
      };
    },
    setChangelog(state, payload: StoryblokStory['content'][]) {
      return {
        ...state,
        changelog: payload,
      };
    },
    setLastOpened(state, payload: number) {
      return {
        ...state,
        lastOpened: payload,
      };
    },
    setOnboardingExplainerSets(state, payload: boolean) {
      return {
        ...state,
        onboardingExplainerSets: payload,
      };
    },
    setOnboardingExplainerExportSets(state, payload: boolean) {
      return {
        ...state,
        onboardingExplainerExportSets: payload,
      };
    },
    setOnboardingExplainerSyncProviders(state, payload: boolean) {
      return {
        ...state,
        onboardingExplainerSyncProviders: payload,
      };
    },
    setOnboardingExplainerInspect(state, payload: boolean) {
      return {
        ...state,
        onboardingExplainerInspect: payload,
      };
    },
    setTokenFilter(state, payload: string) {
      return {
        ...state,
        tokenFilter: payload,
      };
    },
    toggleShowEmptyGroups(state, payload: boolean | null) {
      return {
        ...state,
        showEmptyGroups: payload == null ? !state.showEmptyGroups : payload,
      };
    },
    toggleCollapsed(state) {
      return {
        ...state,
        collapsed: !state.collapsed,
      };
    },
    addJobTasks(state, payload: AddJobTasksPayload) {
      return {
        ...state,
        backgroundJobs: state.backgroundJobs.map((job) => {
          if (job.name === payload.name) {
            return {
              ...job,
              ...(payload.expectedTimePerTask ? {
                timePerTask: payload.expectedTimePerTask,
              } : {}),
              completedTasks: job.completedTasks ?? 0,
              totalTasks: (job.totalTasks ?? 0) + payload.count,
            };
          }
          return job;
        }),
      };
    },
    completeJobTasks(state, payload: CompleteJobTasksPayload) {
      return {
        ...state,
        backgroundJobs: state.backgroundJobs.map((job) => {
          if (job.name === payload.name) {
            const totalCompletedTasks = (job.completedTasks ?? 0) + payload.count;
            return {
              ...job,
              timePerTask: payload.timePerTask ?? job.timePerTask,
              completedTasks: totalCompletedTasks,
              totalTasks: (job.totalTasks ?? totalCompletedTasks),
            };
          }
          return job;
        }),
      };
    },
    setManageThemesModalOpen(state, open: boolean) {
      return {
        ...state,
        manageThemesModalOpen: open,
      };
    },
    setScrollPositionSet(state, payload: Record<string, number>) {
      return {
        ...state,
        scrollPositionSet: payload,
      };
    },
    setFigmaFonts(state, payload: Font[]) {
      return {
        ...state,
        figmaFonts: payload,
      };
    },
    toggleSecondScreen(state) {
      return {
        ...state,
        secondScreenEnabled: !state.secondScreenEnabled,
      };
    },
    setShowAutoSuggest: (state, data: boolean) => ({
      ...state,
      showAutoSuggest: data,
    }),
    setSidebarWidth: (state, data: number) => ({
      ...state,
      sidebarWidth: data,
    }),
    setSelectedExportThemes: (state, data: string[]) => ({
      ...state,
      selectedExportThemes: data,
    }),
  },
  effects: (dispatch) => ({
    setLastOpened: (payload) => {
      fetchChangelog(payload, (result) => {
        dispatch.uiState.setChangelog(result);
      });
    },
    setOnboardingExplainerSets: (payload) => {
      AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.SET_ONBOARDINGEXPLAINERSETS,
        onboardingExplainerSets: payload,
      });
    },
    setOnboardingExplainerExportSets: (payload) => {
      AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.SET_ONBOARDINGEXPLAINEREXPORTSETS,
        onboardingExplainerExportSets: payload,
      });
    },
    setOnboardingExplainerSyncProviders: (payload) => {
      AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.SET_ONBOARDINGEXPLAINERSYNCPROVIDERS,
        onboardingExplainerSyncProviders: payload,
      });
    },
    setOnboardingExplainerInspect: (payload) => {
      AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.SET_ONBOARDINGEXPLAINERINSPECT,
        onboardingExplainerInspect: payload,
      });
    },
    setActiveTab: (payload: Tabs) => {
      const requiresSelectionValues = payload === Tabs.INSPECTOR;

      AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.CHANGED_TABS,
        requiresSelectionValues,
      });
    },
    toggleShowEmptyGroups(payload: null | boolean, rootState) {
      AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.SET_SHOW_EMPTY_GROUPS,
        showEmptyGroups: payload == null ? rootState.uiState.showEmptyGroups : payload,
      });
    },
    setSelectedExportThemes: (payload: string[]) => {
      AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.SET_SELECTED_EXPORT_THEMES,
        themes: JSON.stringify(payload),
      });
    },
  }),
});

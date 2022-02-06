/* eslint-disable import/prefer-default-export */
import { createModel } from '@rematch/core';
import { StorageType, StorageProviderType, ApiDataType } from '@/types/api';
import { track } from '@/utils/analytics';
import { ShadowTokenSingleValue, TypographyObject } from '@/types/propertyTypes';
import { SelectionGroup, TokenType } from '@/types/tokens';
import type { RootModel } from '.';
import fetchChangelog from '@/utils/storyblok';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';

type TabNames = 'start' | 'tokens' | 'json' | 'inspector' | 'syncsettings' | 'settings';

type DisplayType = 'GRID' | 'LIST';

type SelectionValue = NodeTokenRefMap;

interface EditTokenObjectCommonProperties {
  name: string;
  initialName: string;
  path: string;
  isPristine: boolean;
  explainer?: string;
  property: string;
  schema: object;
  optionsSchema: object;
  options: object;
  type: TokenType;
}

export type EditTokenObject =
    | (EditTokenObjectCommonProperties & {
      type: 'boxShadow';
      value: ShadowTokenSingleValue[] | ShadowTokenSingleValue;
    })
    | (EditTokenObjectCommonProperties & {
      type: 'typography';
      value: TypographyObject;
    })
    | (EditTokenObjectCommonProperties & {
      type: TokenType;
      value: string | number;
    });

export type ConfirmProps = {
  show?: boolean;
  text?: string;
  description?: string;
  choices?: { key: string; label: string; enabled?: boolean, unique?: boolean }[];
  confirmAction?: string;
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
  activeTab: TabNames;
  projectURL: string;
  storageType: StorageType;
  api: ApiDataType;
  apiProviders: ApiDataType[];
  localApiState: ApiDataType;
  lastUpdatedAt: Date | null;
  changelog: object[];
  lastOpened: number | null;
  editToken: EditTokenObject | null;
  showEditForm: boolean;
  tokenFilter: string;
  tokenFilterVisible: boolean;
  confirmState: ConfirmProps;
  showPushDialog: string | false;
  showEmptyGroups: boolean;
  collapsed: boolean;
  selectedLayers: boolean;
}

const defaultConfirmState: ConfirmProps = {
  show: false,
  text: '',
  description: '',
  choices: undefined,
  confirmAction: 'Yes',
};

export const uiState = createModel<RootModel>()({
  state: {
    selectionValues: [] as SelectionGroup[],
    mainNodeSelectionValues: {} as SelectionValue,
    disabled: false,
    displayType: 'GRID',
    backgroundJobs: [],
    activeTab: 'start',
    projectURL: '',
    storageType: {
      provider: StorageProviderType.LOCAL,
    },
    api: null,
    apiProviders: [],
    localApiState: {
      provider: StorageProviderType.LOCAL,
      new: false,
    },
    lastUpdatedAt: null,
    changelog: [],
    lastOpened: '',
    editToken: null,
    showEditForm: false,
    tokenFilter: '',
    tokenFilterVisible: false,
    confirmState: defaultConfirmState,
    showPushDialog: false,
    showEmptyGroups: true,
    collapsed: false,
    selectedLayers: false,
  } as unknown as UIState,
  reducers: {
    setShowPushDialog: (state, data: string | false) => ({
      ...state,
      showPushDialog: data,
    }),
    setShowConfirm: (
      state,
      data: {
        text: string;
        description?: string;
        choices: { key: string; label: string; enabled?: boolean; unique?: boolean }[];
        confirmAction?: string;
      },
    ) => ({
      ...state,
      confirmState: {
        show: true,
        text: data.text,
        description: data.description,
        choices: data.choices,
        confirmAction: data.confirmAction || defaultConfirmState.confirmAction,
      },
    }),
    setSelectedLayers: (state, data: boolean) => ({
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
    setActiveTab(state, payload: TabNames) {
      return {
        ...state,
        activeTab: payload,
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
    setApiData(state, payload: ApiDataType) {
      return {
        ...state,
        api: payload,
      };
    },
    setLocalApiState(state, payload: ApiDataType) {
      return {
        ...state,
        localApiState: payload,
      };
    },
    setAPIProviders(state, payload: ApiDataType[]) {
      return {
        ...state,
        apiProviders: payload,
      };
    },
    setChangelog(state, payload: object[]) {
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
    toggleFilterVisibility(state) {
      return {
        ...state,
        tokenFilterVisible: !state.tokenFilterVisible,
      };
    },
    setTokenFilter(state, payload: string) {
      return {
        ...state,
        tokenFilter: payload,
      };
    },
    toggleShowEmptyGroups(state) {
      return {
        ...state,
        showEmptyGroups: !state.showEmptyGroups,
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
  },
  effects: (dispatch) => ({
    setLastOpened: (payload) => {
      fetchChangelog(payload, (result) => {
        dispatch.uiState.setChangelog(result);
      });
    },
  }),
});

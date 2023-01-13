import type { BackgroundJob } from '@/app/store/models/uiState';
import type { SelectionGroup } from './SelectionGroup';
import type { SelectionValue } from './SelectionValue';
import type { AnyTokenList, TokenStore } from './tokens';
import type { UpdateMode } from '@/constants/UpdateMode';
import type { StorageTypeCredentials } from './StorageType';

export enum MessageFromPluginTypes {
  SELECTION = 'selection',
  NO_SELECTION = 'noselection',
  STYLES = 'styles',
  API_PROVIDERS = 'apiProviders',
  UI_SETTINGS = 'uiSettings',
  SHOW_EMPTY_GROUPS = 'show_empty_groups',
  START_JOB = 'start_job',
  COMPLETE_JOB = 'complete_job',
  CLEAR_JOBS = 'clear_jobs',
  ADD_JOB_TASKS = 'add_job_tasks',
  COMPLETE_JOB_TASKS = 'complete_job_tasks',
  SET_TOKENS = 'set_tokens',
  NOTIFY_EXCEPTION = 'notify_exception',
  TRACK_FROM_PLUGIN = 'track_from_plugin',
}

export type NoSelectionFromPluginMessage = { type: MessageFromPluginTypes.NO_SELECTION };
export type SelectionFromPluginMessage = {
  type: MessageFromPluginTypes.SELECTION;
  selectionValues: SelectionGroup[];
  mainNodeSelectionValues: SelectionValue[];
  selectedNodes: number;
};
export type UiSettingsFromPluginMessage = {
  type: MessageFromPluginTypes.UI_SETTINGS;
  settings: {
    uiWindow: {
      width: number;
      height: number;
      isMinimized: boolean;
    };
    updateMode: UpdateMode;
    updateRemote: boolean;
    updateOnChange: boolean;
    updateStyles: boolean;
    ignoreFirstPartForStyles: boolean;
    prefixStylesWithThemeName: boolean;
    inspectDeep: boolean;
    shouldSwapStyles: boolean;
    baseFontSize: string;
    aliasBaseFontSize: string;
  };
};

export type ShowEmptyGroupsFromPluginMessage = {
  type: MessageFromPluginTypes.SHOW_EMPTY_GROUPS;
  showEmptyGroups: boolean;
};
export type ApiProvidersFromPluginMessage = {
  type: MessageFromPluginTypes.API_PROVIDERS;
  providers: StorageTypeCredentials[];
};
export type StylesFromPluginMessage = {
  type: MessageFromPluginTypes.STYLES;
  values?: Record<string, AnyTokenList>;
};
export type StartJobFromPluginMessage = {
  type: MessageFromPluginTypes.START_JOB;
  job: BackgroundJob;
};
export type CompleteJobFromPluginMessage = {
  type: MessageFromPluginTypes.COMPLETE_JOB;
  name: string;
};
export type ClearJobsFromPluginMessage = {
  type: MessageFromPluginTypes.CLEAR_JOBS;
};
export type AddJobTasksFromPluginMessage = {
  type: MessageFromPluginTypes.ADD_JOB_TASKS;
  name: string;
  count: number;
  expectedTimePerTask?: number;
};
export type CompleteJobTasksFromPluginMessage = {
  type: MessageFromPluginTypes.COMPLETE_JOB_TASKS;
  name: string;
  count: number;
  timePerTask?: number;
};

export type SetTokensFromPluginMessage = {
  type: MessageFromPluginTypes.SET_TOKENS;
  values: TokenStore;
};

export type NotifyExceptionFromPluginMessage = {
  type: MessageFromPluginTypes.NOTIFY_EXCEPTION;
  error: string;
  opts?: Record<string, unknown>;
};

export type TrackFromPluginMessage = {
  type: MessageFromPluginTypes.TRACK_FROM_PLUGIN;
  title: string;
  opts?: Record<string, unknown>;
};

export type PostToUIMessage =
  | NoSelectionFromPluginMessage
  | SelectionFromPluginMessage
  | UiSettingsFromPluginMessage
  | ShowEmptyGroupsFromPluginMessage
  | ApiProvidersFromPluginMessage
  | StylesFromPluginMessage
  | StartJobFromPluginMessage
  | CompleteJobFromPluginMessage
  | ClearJobsFromPluginMessage
  | AddJobTasksFromPluginMessage
  | CompleteJobTasksFromPluginMessage
  | SetTokensFromPluginMessage
  | SetTokensFromPluginMessage
  | NotifyExceptionFromPluginMessage
  | TrackFromPluginMessage;

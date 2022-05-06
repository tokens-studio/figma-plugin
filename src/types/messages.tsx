import type { BackgroundJob } from '@/app/store/models/uiState';
import {
  ApiDataType, StorageType,
} from './api';
import { UpdateMode } from './state';
import { SelectionGroup } from './SelectionGroup';
import { SelectionValue } from './SelectionValue';
import { TokenStore } from './tokens';
import { UsedTokenSetsMap } from './UsedTokenSetsMap';

export enum MessageFromPluginTypes {
  SELECTION = 'selection',
  NO_SELECTION = 'noselection',
  REMOTE_COMPONENTS = 'remotecomponents',
  TOKEN_VALUES = 'tokenvalues',
  STYLES = 'styles',
  RECEIVED_STORAGE_TYPE = 'receivedStorageType',
  API_CREDENTIALS = 'apiCredentials',
  API_PROVIDERS = 'apiProviders',
  USER_ID = 'userId',
  RECEIVED_LAST_OPENED = 'receivedLastOpened',
  UI_SETTINGS = 'uiSettings',
  SHOW_EMPTY_GROUPS = 'show_empty_groups',
  START_JOB = 'start_job',
  COMPLETE_JOB = 'complete_job',
  CLEAR_JOBS = 'clear_jobs',
  ADD_JOB_TASKS = 'add_job_tasks',
  COMPLETE_JOB_TASKS = 'complete_job_tasks',
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
    inspectDeep: boolean;
  };
};

export type ShowEmptyGroupsFromPluginMessage = {
  type: MessageFromPluginTypes.SHOW_EMPTY_GROUPS;
  showEmptyGroups: boolean;
};
export type RemoteCommentsFromPluginMessage = {
  type: MessageFromPluginTypes.REMOTE_COMPONENTS;
};
export type TokenValuesFromPluginMessage = {
  type: MessageFromPluginTypes.TOKEN_VALUES;
  values: TokenStore;
};
export type ReceivedStorageTypeFromPluginMessage = {
  type: MessageFromPluginTypes.RECEIVED_STORAGE_TYPE;
  storageType: StorageType;
};
export type ApiProvidersFromPluginMessage = {
  type: MessageFromPluginTypes.API_PROVIDERS;
  providers: ApiDataType[];
};
export type StylesFromPluginMessage = {
  type: MessageFromPluginTypes.STYLES;
  values?: any;
};
export type UserIdFromPluginMessage = {
  type: MessageFromPluginTypes.USER_ID;
  user: { userId: string; figmaId: string | null; name: string };
};
export type ReceivedLastOpenedFromPluginMessage = {
  type: MessageFromPluginTypes.RECEIVED_LAST_OPENED;
  lastOpened: number;
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
export type ApiCredentialsFromPluginMessage = {
  type: MessageFromPluginTypes.API_CREDENTIALS;
  status: boolean;
  credentials: ApiDataType & {
    internalId?: string;
  };
  featureFlagId: string;
  usedTokenSet?: UsedTokenSetsMap | null;
  activeTheme?: string | null;
};
export type PostToUIMessage =
  | NoSelectionFromPluginMessage
  | SelectionFromPluginMessage
  | UiSettingsFromPluginMessage
  | ShowEmptyGroupsFromPluginMessage
  | RemoteCommentsFromPluginMessage
  | TokenValuesFromPluginMessage
  | ReceivedStorageTypeFromPluginMessage
  | ApiProvidersFromPluginMessage
  | StylesFromPluginMessage
  | UserIdFromPluginMessage
  | ReceivedLastOpenedFromPluginMessage
  | StartJobFromPluginMessage
  | CompleteJobFromPluginMessage
  | ClearJobsFromPluginMessage
  | AddJobTasksFromPluginMessage
  | CompleteJobTasksFromPluginMessage
  | ApiCredentialsFromPluginMessage;

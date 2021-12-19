import { SettingsState } from '@/app/store/models/settings';
import {
  ApiDataType, ContextObject, StorageProviderType, StorageType,
} from './api';
import { NodeTokenRefMap } from './NodeTokenRefMap';
import { UpdateMode } from './state';
import { PullStyleTypes, TokenArrayGroup, TokenGroup } from './tokens';

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
}

export enum MessageToPluginTypes {
  INITIATE = 'initiate',
  REMOVE_SINGLE_CREDENTIAL = 'remove-single-credential',
  GO_TO_NODE = 'gotonode',
  CREDENTIALS = 'credentials',
  UPDATE = 'update',
  CREATE_STYLES = 'create-styles',
  SET_NODE_DATA = 'set-node-data',
  REMOVE_NODE_DATA = 'remove-node-data',
  PULL_STYLES = 'pull-styles',
  SET_STORAGE_TYPE = 'set-storage-type',
  NOTIFY = 'notify',
  SET_UI = 'set_ui',
  RESIZE_WINDOW = 'resize_window',
}

export type NoSelectionFromPluginMessage = { type: MessageFromPluginTypes.NO_SELECTION };
export type SelectionFromPluginMessage = {
  type: MessageFromPluginTypes.SELECTION;
  nodes?: string;
  values?: NodeTokenRefMap;
};
export type UiSettingsFromPluginMessage = {
  type: MessageFromPluginTypes.UI_SETTINGS;
  settings: {
    uiWindow: {
      width: number;
      height: number;
    };
    updateMode: UpdateMode;
    updateRemote: boolean;
    updateOnChange: boolean;
    updateStyles: boolean;
    ignoreFirstPartForStyles: boolean;
  };
};
export type RemoteCommentsFromPluginMessage = {
  type: MessageFromPluginTypes.REMOTE_COMPONENTS;
  values: {
    // @TODO fix typings
    nodes: any[];
    remotes: any[];
  };
};
export type TokenValuesFromPluginMessage = {
  type: MessageFromPluginTypes.TOKEN_VALUES;
  values?: any;
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
  userId: string;
};
export type ReceivedLastOpenedFromPluginMessage = {
  type: MessageFromPluginTypes.RECEIVED_LAST_OPENED;
  lastOpened: number;
};
export type PostToUIMessage =
    | NoSelectionFromPluginMessage
    | SelectionFromPluginMessage
    | UiSettingsFromPluginMessage
    | RemoteCommentsFromPluginMessage
    | TokenValuesFromPluginMessage
    | ReceivedStorageTypeFromPluginMessage
    | ApiProvidersFromPluginMessage
    | StylesFromPluginMessage
    | UserIdFromPluginMessage
    | ReceivedLastOpenedFromPluginMessage;

export type InitiateToPluginMessage = { type: MessageToPluginTypes.INITIATE };
export type RemoveSingleCredentialToPluginMessage = {
  type: MessageToPluginTypes.REMOVE_SINGLE_CREDENTIAL;
  context: ContextObject;
};
export type GoToNodeToPluginMessage = {
  type: MessageToPluginTypes.GO_TO_NODE;
  id: string;
};
export type CredentialsToPluginMessage = {
  type: MessageToPluginTypes.CREDENTIALS;
  id: string;
  name: string;
  secret: string;
  provider: StorageProviderType;
};
export type UpdateToPluginMessage = {
  type: MessageToPluginTypes.UPDATE;
  tokenValues: TokenGroup;
  tokens: TokenArrayGroup;
  updatedAt: string;
  settings: SettingsState;
};
export type CreateStylesToPluginMessage = {
  type: MessageToPluginTypes.CREATE_STYLES;
  tokens: TokenArrayGroup;
  settings: SettingsState;
};
export type SetNodeDataToPluginMessage = {
  type: MessageToPluginTypes.SET_NODE_DATA;
  values: NodeTokenRefMap;
  tokens: TokenArrayGroup;
  settings: SettingsState;
};
export type RemoveDataToPluginMessage = {
  type: MessageToPluginTypes.REMOVE_NODE_DATA;
  key: string;
};
export type PullStylesToPluginMessage = {
  type: MessageToPluginTypes.PULL_STYLES;
  styleTypes: PullStyleTypes;
};
export type SetStorageTypeToPluginMessage = {
  type: MessageToPluginTypes.SET_STORAGE_TYPE;
  storageType: ContextObject;
};
export type NotifyToPluginMessage = {
  type: MessageToPluginTypes.NOTIFY;
  msg: string;
  opts: {
    timeout?: number;
  };
};
export type SetUiToPluginMessage = SettingsState & {
  type: MessageToPluginTypes.SET_UI;
};
export type ResizeWindowToPluginMessage = {
  type: MessageToPluginTypes.RESIZE_WINDOW;
  width: number;
  height: number;
};
export type PostToFigmaMessage =
    | InitiateToPluginMessage
    | RemoveSingleCredentialToPluginMessage
    | GoToNodeToPluginMessage
    | CredentialsToPluginMessage
    | UpdateToPluginMessage
    | CreateStylesToPluginMessage
    | SetNodeDataToPluginMessage
    | RemoveDataToPluginMessage
    | PullStylesToPluginMessage
    | SetStorageTypeToPluginMessage
    | NotifyToPluginMessage
    | SetUiToPluginMessage
    | ResizeWindowToPluginMessage;

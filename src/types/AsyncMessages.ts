import { UpdateMode } from '@/constants/UpdateMode';
import type { SettingsState } from '@/app/store/models/settings';
import type { Properties } from '@/constants/Properties';
import type { TokenTypes } from '@/constants/TokenTypes';
import type { NodeInfo } from './NodeInfo';
import type { NodeTokenRefMap } from './NodeTokenRefMap';
import type { PullStyleOptions } from './PullStylesOptions';
import type { ThemeObjectsList } from './ThemeObjectsList';
import type { AnyTokenList } from './tokens';
import type { UsedTokenSetsMap } from './UsedTokenSetsMap';
import type { StorageType, StorageTypeCredentials } from './StorageType';
import type { Direction } from '@/constants/Direction';
import type { SelectionValue } from './SelectionValue';
import type { startup } from '@/utils/plugin';
import type { ThemeObject } from './ThemeObject';
import { DeleteTokenPayload } from './payloads';

export enum AsyncMessageTypes {
  // the below messages are going from UI to plugin
  CREATE_STYLES = 'async/create-styles',
  REMOVE_STYLES = 'async/remove-styles',
  CREDENTIALS = 'async/credentials',
  CHANGED_TABS = 'async/changed-tabs',
  REMOVE_SINGLE_CREDENTIAL = 'async/remove-single-credential',
  SET_STORAGE_TYPE = 'async/set-storage-type',
  SET_NODE_DATA = 'async/set-node-data',
  REMOVE_TOKENS_BY_VALUE = 'async/remove-tokens-by-value',
  REMAP_TOKENS = 'async/remap-tokens',
  GOTO_NODE = 'async/goto-node',
  SELECT_NODES = 'async/select-nodes',
  PULL_STYLES = 'async/pull-styles',
  NOTIFY = 'async/notify',
  CANCEL_OPERATION = 'async/cancel-operation',
  RESIZE_WINDOW = 'async/resize-window',
  SET_SHOW_EMPTY_GROUPS = 'async/set-show-empty-groups',
  SET_UI = 'async/set-ui',
  CREATE_ANNOTATION = 'async/create-annotation',
  UPDATE = 'async/update',
  SET_LICENSE_KEY = 'async/set-license-key',
  ATTACH_LOCAL_STYLES_TO_THEME = 'async/attach-local-styles-to-theme',
  RESOLVE_STYLE_INFO = 'async/resolve-style-info',
  // the below messages are going from plugin to UI
  STARTUP = 'async/startup',
  GET_THEME_INFO = 'async/get-theme-info',
}

export type AsyncMessage<T extends AsyncMessageTypes, P = unknown> = P & { type: T };

export type CredentialsAsyncMessage = AsyncMessage<AsyncMessageTypes.CREDENTIALS, {
  credential: StorageTypeCredentials;
}>;
export type CredentialsAsyncMessageResult = AsyncMessage<AsyncMessageTypes.CREDENTIALS>;

export type ChangedTabsAsyncMessage = AsyncMessage<AsyncMessageTypes.CHANGED_TABS, { requiresSelectionValues: boolean; }>;
export type ChangedTabsAsyncMessageResult = AsyncMessage<AsyncMessageTypes.CHANGED_TABS>;

export type RemoveSingleCredentialAsyncMessage = AsyncMessage<AsyncMessageTypes.REMOVE_SINGLE_CREDENTIAL, { context: StorageTypeCredentials; }>;
export type RemoveSingleCredentialAsyncMessageResult = AsyncMessage<AsyncMessageTypes.REMOVE_SINGLE_CREDENTIAL>;

export type SetStorageTypeAsyncMessage = AsyncMessage<AsyncMessageTypes.SET_STORAGE_TYPE, { storageType: StorageType; }>;
export type SetStorageTypeAsyncMessageResult = AsyncMessage<AsyncMessageTypes.SET_STORAGE_TYPE>;

export type SetNodeDataAsyncMessage = AsyncMessage<AsyncMessageTypes.SET_NODE_DATA, { values: NodeTokenRefMap; tokens: AnyTokenList; settings: SettingsState; }>;
export type SetNodeDataAsyncMessageResult = AsyncMessage<AsyncMessageTypes.SET_NODE_DATA>;

export type RemoveTokensByValueAsyncMessage = AsyncMessage<AsyncMessageTypes.REMOVE_TOKENS_BY_VALUE, {
  tokensToRemove: { nodes: NodeInfo[]; property: Properties }[];
}>;
export type RemoveTokensByValueAsyncMessageResult = AsyncMessage<AsyncMessageTypes.REMOVE_TOKENS_BY_VALUE>;

export type RemapTokensAsyncMessage = AsyncMessage<AsyncMessageTypes.REMAP_TOKENS, {
  oldName: string;
  newName: string;
  updateMode: UpdateMode;
  category?: Properties | TokenTypes;
  tokens?: AnyTokenList;
  settings?: SettingsState;
}>;
export type RemapTokensMessageAsyncResult = AsyncMessage<AsyncMessageTypes.REMAP_TOKENS>;

export type GotoNodeAsyncMessage = AsyncMessage<AsyncMessageTypes.GOTO_NODE, {
  id: string;
}>;
export type GotoNodeMessageAsyncResult = AsyncMessage<AsyncMessageTypes.GOTO_NODE>;

export type SelectNodesAsyncMessage = AsyncMessage<AsyncMessageTypes.SELECT_NODES, { ids: string[] }>;
export type SelectNodesMessageAsyncResult = AsyncMessage<AsyncMessageTypes.SELECT_NODES>;

export type PullStylesAsyncMessage = AsyncMessage<AsyncMessageTypes.PULL_STYLES, { styleTypes: PullStyleOptions; }>;
export type PullStylesAsyncMessageResult = AsyncMessage<AsyncMessageTypes.PULL_STYLES>;

export type NotifyAsyncMessage = AsyncMessage<AsyncMessageTypes.NOTIFY, {
  msg: string;
  opts: NotificationOptions;
}>;
export type NotifyAsyncMessageResult = AsyncMessage<AsyncMessageTypes.NOTIFY>;

export type ResizeWindowAsyncMessage = AsyncMessage<AsyncMessageTypes.RESIZE_WINDOW, {
  width: number;
  height: number;
}>;
export type ResizeWindowAsyncMessageResult = AsyncMessage<AsyncMessageTypes.RESIZE_WINDOW>;

export type CancelOperationAsyncMessage = AsyncMessage<AsyncMessageTypes.CANCEL_OPERATION>;
export type CancelOperationAsyncMessageResult = AsyncMessage<AsyncMessageTypes.CANCEL_OPERATION>;

export type SetShowEmptyGroupsAsyncMessage = AsyncMessage<AsyncMessageTypes.SET_SHOW_EMPTY_GROUPS, { showEmptyGroups: boolean; }>;
export type SetShowEmptyGroupsAsyncMessageResult = AsyncMessage<AsyncMessageTypes.SET_SHOW_EMPTY_GROUPS>;

export type SetUiAsyncMessage = AsyncMessage<AsyncMessageTypes.SET_UI, SettingsState>;
export type SetUiAsyncMessageResult = AsyncMessage<AsyncMessageTypes.SET_UI>;

export type CreateAnnotationAsyncMessage = AsyncMessage<AsyncMessageTypes.CREATE_ANNOTATION, {
  tokens: SelectionValue;
  direction: Direction;
}>;
export type CreateAnnotationAsyncMessageResult = AsyncMessage<AsyncMessageTypes.CREATE_ANNOTATION>;

export type CreateStylesAsyncMessage = AsyncMessage<AsyncMessageTypes.CREATE_STYLES, {
  tokens: AnyTokenList;
  settings: Partial<SettingsState>;
}>;
export type CreateStylesAsyncMessageResult = AsyncMessage<AsyncMessageTypes.CREATE_STYLES, {
  styleIds: Record<string, string>;
}>;

export type RemoveStylesAsyncMessage = AsyncMessage<AsyncMessageTypes.REMOVE_STYLES, {
  token: DeleteTokenPayload;
  settings: Partial<SettingsState>;
}>;
export type RemoveStylesAsyncMessageResult = AsyncMessage<AsyncMessageTypes.REMOVE_STYLES, {
  styleIds: Record<string, string>;
}>;

export type UpdateAsyncMessage = AsyncMessage<AsyncMessageTypes.UPDATE, {
  tokenValues: Record<string, AnyTokenList>;
  tokens: AnyTokenList | null;
  themes: ThemeObjectsList
  updatedAt: string;
  settings: SettingsState;
  usedTokenSet: UsedTokenSetsMap;
  activeTheme: string | null;
  checkForChanges?: boolean
}>;
export type UpdateAsyncMessageResult = AsyncMessage<AsyncMessageTypes.UPDATE, {
  styleIds: Record<string, string>;
}>;

export type SetLicenseKeyMessage = AsyncMessage<AsyncMessageTypes.SET_LICENSE_KEY, {
  licenseKey: string | null
}>;
export type SetLicenseKeyMessageResult = AsyncMessage<AsyncMessageTypes.SET_LICENSE_KEY>;

export type AttachLocalStylesToTheme = AsyncMessage<AsyncMessageTypes.ATTACH_LOCAL_STYLES_TO_THEME, {
  theme: ThemeObject
  tokens: Record<string, AnyTokenList>
  category: 'typography' | 'colors' | 'effects' | 'all'
  settings?: Partial<SettingsState>
}>;
export type AttachLocalStylesToThemeResult = AsyncMessage<AsyncMessageTypes.ATTACH_LOCAL_STYLES_TO_THEME, ThemeObject>;

export type ResolveStyleInfo = AsyncMessage<AsyncMessageTypes.RESOLVE_STYLE_INFO, {
  styleIds: string[]
}>;
export type ResolveStyleInfoResult = AsyncMessage<AsyncMessageTypes.RESOLVE_STYLE_INFO, {
  resolvedValues: {
    id: string
    key?: string
    name?: string
  }[];
}>;

export type GetThemeInfoMessage = AsyncMessage<AsyncMessageTypes.GET_THEME_INFO>;
export type GetThemeInfoMessageResult = AsyncMessage<AsyncMessageTypes.GET_THEME_INFO, {
  activeTheme: string | null
  themes: ThemeObjectsList
}>;

export type StartupMessage = AsyncMessage<AsyncMessageTypes.STARTUP, (
  ReturnType<typeof startup> extends Promise<infer V> ? V : unknown
)>;
export type StartupMessageResult = AsyncMessage<AsyncMessageTypes.STARTUP>;

export type AsyncMessages =
  CreateStylesAsyncMessage
  | RemoveStylesAsyncMessage
  | CredentialsAsyncMessage
  | ChangedTabsAsyncMessage
  | RemoveSingleCredentialAsyncMessage
  | SetStorageTypeAsyncMessage
  | SetNodeDataAsyncMessage
  | RemoveTokensByValueAsyncMessage
  | RemapTokensAsyncMessage
  | GotoNodeAsyncMessage
  | SelectNodesAsyncMessage
  | PullStylesAsyncMessage
  | NotifyAsyncMessage
  | ResizeWindowAsyncMessage
  | CancelOperationAsyncMessage
  | SetShowEmptyGroupsAsyncMessage
  | SetUiAsyncMessage
  | CreateAnnotationAsyncMessage
  | UpdateAsyncMessage
  | GetThemeInfoMessage
  | SetLicenseKeyMessage
  | StartupMessage
  | AttachLocalStylesToTheme
  | ResolveStyleInfo;

export type AsyncMessageResults =
  CreateStylesAsyncMessageResult
  | RemoveStylesAsyncMessageResult
  | CredentialsAsyncMessageResult
  | ChangedTabsAsyncMessageResult
  | RemoveSingleCredentialAsyncMessageResult
  | SetStorageTypeAsyncMessageResult
  | SetNodeDataAsyncMessageResult
  | RemoveTokensByValueAsyncMessageResult
  | RemapTokensMessageAsyncResult
  | GotoNodeMessageAsyncResult
  | SelectNodesMessageAsyncResult
  | PullStylesAsyncMessageResult
  | NotifyAsyncMessageResult
  | ResizeWindowAsyncMessageResult
  | CancelOperationAsyncMessage
  | SetShowEmptyGroupsAsyncMessageResult
  | SetUiAsyncMessageResult
  | CreateAnnotationAsyncMessageResult
  | UpdateAsyncMessageResult
  | GetThemeInfoMessageResult
  | SetLicenseKeyMessageResult
  | StartupMessageResult
  | AttachLocalStylesToThemeResult
  | ResolveStyleInfoResult;

export type AsyncMessagesMap = {
  [K in AsyncMessageTypes]: Extract<AsyncMessages, { type: K }>
};
export type AsyncMessageResultsMap = {
  [K in AsyncMessageTypes]: Extract<AsyncMessageResults, { type: K }>
};

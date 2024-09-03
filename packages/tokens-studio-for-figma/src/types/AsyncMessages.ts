import { UpdateMode } from '@/constants/UpdateMode';
import type { SettingsState } from '@/app/store/models/settings';
import type { Properties } from '@/constants/Properties';
import type { TokenTypes } from '@/constants/TokenTypes';
import type { NodeInfo } from './NodeInfo';
import type { NodeTokenRefMap } from './NodeTokenRefMap';
import type { PullStyleOptions } from './PullStylesOptions';
import type { PullVariablesOptions } from './PullVariablesOptions';
import type { ThemeObjectsList } from './ThemeObjectsList';
import type { AnyTokenList } from './tokens';
import type { UsedTokenSetsMap } from './UsedTokenSetsMap';
import type { StorageType, StorageTypeCredentials } from './StorageType';
import type { Direction } from '@/constants/Direction';
import type { SelectionValue } from './SelectionValue';
import type { startup } from '@/utils/plugin';
import type { ThemeObject } from './ThemeObject';
import { DeleteTokenPayload } from './payloads';
import { TokensToRenamePayload } from '@/app/store/useTokens';
import { AuthData } from './Auth';
import { LocalVariableInfo } from '@/plugin/createLocalVariablesInPlugin';
import { ResolvedVariableInfo } from '@/plugin/asyncMessageHandlers';
import { RenameVariableToken } from '@/app/store/models/reducers/tokenState';
import { UpdateTokenVariablePayload } from './payloads/UpdateTokenVariablePayload';
import { TokenFormatOptions } from '@/plugin/TokenFormatStoreClass';
import { ExportTokenSet } from './ExportTokenSet';

export enum AsyncMessageTypes {
  // the below messages are going from UI to plugin
  CREATE_STYLES = 'async/create-styles',
  RENAME_STYLES = 'async/rename-styles',
  REMOVE_STYLES = 'async/remove-styles',
  CREDENTIALS = 'async/credentials',
  CHANGED_TABS = 'async/changed-tabs',
  SET_ONBOARDINGEXPLAINERSETS = 'async/set-onboardingExplainerSets',
  SET_ONBOARDINGEXPLAINEREXPORTSETS = 'async/set-onboardingExplainerExportSets',
  SET_ONBOARDINGEXPLAINERSYNCPROVIDERS = 'async/set-onboardingExplainerSyncProviders',
  SET_ONBOARDINGEXPLAINERINSPECT = 'async/set-onboardingExplainerInspect',
  REMOVE_SINGLE_CREDENTIAL = 'async/remove-single-credential',
  SET_STORAGE_TYPE = 'async/set-storage-type',
  SET_NODE_DATA = 'async/set-node-data',
  REMOVE_TOKENS_BY_VALUE = 'async/remove-tokens-by-value',
  REMAP_TOKENS = 'async/remap-tokens',
  BULK_REMAP_TOKENS = 'async/bulk-remap-tokens',
  GOTO_NODE = 'async/goto-node',
  SELECT_NODES = 'async/select-nodes',
  PULL_STYLES = 'async/pull-styles',
  PULL_VARIABLES = 'async/pull-variables',
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
  SET_NONE_VALUES_ON_NODE = 'async/set-none-values-on-node',
  SET_AUTH_DATA = 'async/set-auth-data',
  SET_USED_EMAIL = 'async/set-used-email',
  REMOVE_RELAUNCH_DATA = 'async/remove-relaunch-data',
  // the below messages are going from plugin to UI
  STARTUP = 'async/startup',
  GET_THEME_INFO = 'async/get-theme-info',
  GET_FIGMA_FONTS = 'async/get-figma-fonts',
  GET_LOCAL_STYLES = 'async/get-local-styles',
  CREATE_LOCAL_VARIABLES = 'async/create-local-variables',
  CREATE_LOCAL_VARIABLES_WITHOUT_MODES = 'async/create-local-variables-without-modes',
  RESOLVE_VARIABLE_INFO = 'async/resolve-variable-info',
  ATTACH_LOCAL_VARIABLES_TO_THEME = 'async/attach-local-variables-to-theme',
  RENAME_VARIABLES = 'async/rename-variables',
  UPDATE_VARIABLES = 'async/update-variables',
  SET_INITIAL_LOAD = 'async/set-initial-load',
}

export type AsyncMessage<T extends AsyncMessageTypes, P = unknown> = P & { type: T };

export type CredentialsAsyncMessage = AsyncMessage<AsyncMessageTypes.CREDENTIALS, {
  credential: StorageTypeCredentials;
}>;
export type CredentialsAsyncMessageResult = AsyncMessage<AsyncMessageTypes.CREDENTIALS>;

export type ChangedTabsAsyncMessage = AsyncMessage<AsyncMessageTypes.CHANGED_TABS, { requiresSelectionValues: boolean; }>;
export type ChangedTabsAsyncMessageResult = AsyncMessage<AsyncMessageTypes.CHANGED_TABS>;

export type SetOnboardingExplainerSetsAsyncMessage = AsyncMessage<AsyncMessageTypes.SET_ONBOARDINGEXPLAINERSETS, { onboardingExplainerSets: boolean; }>;
export type SetOnboardingExplainerSetsAsyncMessageResult = AsyncMessage<AsyncMessageTypes.SET_ONBOARDINGEXPLAINERSETS>;

export type SetOnboardingExplainerExportSetsAsyncMessage = AsyncMessage<AsyncMessageTypes.SET_ONBOARDINGEXPLAINEREXPORTSETS, { onboardingExplainerExportSets: boolean; }>;
export type SetOnboardingExplainerExportSetsAsyncMessageResult = AsyncMessage<AsyncMessageTypes.SET_ONBOARDINGEXPLAINEREXPORTSETS>;

export type SetOnboardingExplainerSyncProvidersAsyncMessage = AsyncMessage<AsyncMessageTypes.SET_ONBOARDINGEXPLAINERSYNCPROVIDERS, { onboardingExplainerSyncProviders: boolean; }>;
export type SetOnboardingExplainerSyncProvidersAsyncMessageResult = AsyncMessage<AsyncMessageTypes.SET_ONBOARDINGEXPLAINERSYNCPROVIDERS>;

export type SetOnboardingExplainerInspectAsyncMessage = AsyncMessage<AsyncMessageTypes.SET_ONBOARDINGEXPLAINERINSPECT, { onboardingExplainerInspect: boolean; }>;
export type SetOnboardingExplainerInspectAsyncMessageResult = AsyncMessage<AsyncMessageTypes.SET_ONBOARDINGEXPLAINERINSPECT>;

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

export type SetNoneValuesOnNodeAsyncMessage = AsyncMessage<AsyncMessageTypes.SET_NONE_VALUES_ON_NODE, {
  tokensToSet: { nodes: NodeInfo[]; property: Properties }[];
  tokens: AnyTokenList
}>;
export type SetNoneValuesOnNodeAsyncMessageResult = AsyncMessage<AsyncMessageTypes.SET_NONE_VALUES_ON_NODE>;

export type RemapTokensAsyncMessage = AsyncMessage<AsyncMessageTypes.REMAP_TOKENS, {
  oldName: string;
  newName: string;
  updateMode: UpdateMode;
  category?: Properties | TokenTypes;
  tokens?: AnyTokenList;
  settings?: SettingsState;
}>;
export type RemapTokensMessageAsyncResult = AsyncMessage<AsyncMessageTypes.REMAP_TOKENS>;

export type BulkRemapTokensAsyncMessage = AsyncMessage<AsyncMessageTypes.BULK_REMAP_TOKENS, {
  oldName: string;
  newName: string;
  updateMode: UpdateMode;
}>;
export type BulkRemapTokensMessageAsyncResult = AsyncMessage<AsyncMessageTypes.BULK_REMAP_TOKENS>;

export type GotoNodeAsyncMessage = AsyncMessage<AsyncMessageTypes.GOTO_NODE, {
  id: string;
}>;
export type GotoNodeMessageAsyncResult = AsyncMessage<AsyncMessageTypes.GOTO_NODE>;

export type SelectNodesAsyncMessage = AsyncMessage<AsyncMessageTypes.SELECT_NODES, { ids: string[] }>;
export type SelectNodesMessageAsyncResult = AsyncMessage<AsyncMessageTypes.SELECT_NODES>;

export type PullStylesAsyncMessage = AsyncMessage<AsyncMessageTypes.PULL_STYLES, { styleTypes: PullStyleOptions; }>;
export type PullStylesAsyncMessageResult = AsyncMessage<AsyncMessageTypes.PULL_STYLES>;

export type PullVariablesAsyncMessage = AsyncMessage<AsyncMessageTypes.PULL_VARIABLES, { options: PullVariablesOptions; }>;
export type PullVariablesMessageResult = AsyncMessage<AsyncMessageTypes.PULL_VARIABLES>;

export type NotifyAsyncMessage = AsyncMessage<AsyncMessageTypes.NOTIFY, {
  msg: string;
  opts: {
    error?: boolean
  };
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
  sourceTokens: AnyTokenList;
  settings: SettingsState;
  selectedTheme?: ThemeObject;
}>;
export type CreateStylesAsyncMessageResult = AsyncMessage<AsyncMessageTypes.CREATE_STYLES, {
  styleIds: Record<string, string>;
}>;

export type RenameStylesAsyncMessage = AsyncMessage<AsyncMessageTypes.RENAME_STYLES, {
  tokensToRename: TokensToRenamePayload[];
  parent: string;
  settings: Partial<SettingsState>;
}>;
export type RenameStylesAsyncMessageResult = AsyncMessage<AsyncMessageTypes.RENAME_STYLES, {
  styleIds: string[];
}>;

export type RemoveStylesAsyncMessage = AsyncMessage<AsyncMessageTypes.REMOVE_STYLES, {
  token: DeleteTokenPayload;
  settings: Partial<SettingsState>;
}>;
export type RemoveStylesAsyncMessageResult = AsyncMessage<AsyncMessageTypes.REMOVE_STYLES, {
  styleIds: string[];
}>;

export type UpdateAsyncMessage = AsyncMessage<AsyncMessageTypes.UPDATE, {
  tokenValues: Record<string, AnyTokenList>;
  tokens: AnyTokenList | null;
  themes: ThemeObjectsList
  updatedAt: string;
  settings: SettingsState;
  usedTokenSet: UsedTokenSetsMap;
  activeTheme: Record<string, string>;
  checkForChanges?: boolean
  shouldSwapStyles?: boolean;
  collapsedTokenSets: string[];
  tokenFormat: TokenFormatOptions;
}>;
export type UpdateAsyncMessageResult = AsyncMessage<AsyncMessageTypes.UPDATE, {
  nodes: number
}>;

export type SetLicenseKeyMessage = AsyncMessage<AsyncMessageTypes.SET_LICENSE_KEY, {
  licenseKey: string | null
}>;
export type SetLicenseKeyMessageResult = AsyncMessage<AsyncMessageTypes.SET_LICENSE_KEY>;

export type SetInitialLoadMessage = AsyncMessage<AsyncMessageTypes.SET_INITIAL_LOAD, {
  initialLoad: boolean | null
}>;
export type SetInitialLoadMessageResult = AsyncMessage<AsyncMessageTypes.SET_INITIAL_LOAD>;

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
  activeTheme: Record<string, string>
  themes: ThemeObjectsList
}>;

export type StartupMessage = AsyncMessage<AsyncMessageTypes.STARTUP, (
  ReturnType<typeof startup> extends Promise<infer V> ? V : unknown
)>;
export type StartupMessageResult = AsyncMessage<AsyncMessageTypes.STARTUP>;

export type GetFigmaFontsMessage = AsyncMessage<AsyncMessageTypes.GET_FIGMA_FONTS>;
export type GetFigmaFontsMessageResult = AsyncMessage<AsyncMessageTypes.GET_FIGMA_FONTS, {
  fonts: Array<Font>
}>;
export type GetLocalStylesMessage = AsyncMessage<AsyncMessageTypes.GET_LOCAL_STYLES>;
export type GetLocalStylesMessageResult = AsyncMessage<AsyncMessageTypes.GET_LOCAL_STYLES, {
  styles: Array<PaintStyle | TextStyle | EffectStyle>
}>;
export type SetAuthDataMessage = AsyncMessage<AsyncMessageTypes.SET_AUTH_DATA, {
  auth: AuthData | null
}>;
export type SetAuthDataMessageResult = AsyncMessage<AsyncMessageTypes.SET_AUTH_DATA>;

export type SetUsedEmailMessage = AsyncMessage<AsyncMessageTypes.SET_USED_EMAIL, {
  email: string | undefined
}>;

export type SetUsedEmailMessageResult = AsyncMessage<AsyncMessageTypes.SET_USED_EMAIL>;

export type CreateLocalVariablesAsyncMessage = AsyncMessage<AsyncMessageTypes.CREATE_LOCAL_VARIABLES, {
  tokens: Record<string, AnyTokenList>;
  settings: SettingsState,
  selectedThemes?: string[]
}>;
export type CreateLocalVariablesAsyncMessageResult = AsyncMessage<AsyncMessageTypes.CREATE_LOCAL_VARIABLES, {
  variableIds: Record<string, LocalVariableInfo>
  totalVariables: number
}>;

export type CreateLocalVariablesWithoutModesAsyncMessage = AsyncMessage<AsyncMessageTypes.CREATE_LOCAL_VARIABLES_WITHOUT_MODES, {
  tokens: Record<string, AnyTokenList>;
  settings: SettingsState,
  selectedSets: ExportTokenSet[]
}>;
export type CreateLocalVariablesWithoutModesAsyncMessageResult = AsyncMessage<AsyncMessageTypes.CREATE_LOCAL_VARIABLES_WITHOUT_MODES, {
  variableIds: Record<string, LocalVariableInfo>
  totalVariables: number
}>;

export type ResolveVariableInfo = AsyncMessage<AsyncMessageTypes.RESOLVE_VARIABLE_INFO, {
  variableIds: string[]
}>;
export type ResolveVariableInfoResult = AsyncMessage<AsyncMessageTypes.RESOLVE_VARIABLE_INFO, {
  resolvedValues: Record<string, ResolvedVariableInfo>;
}>;

export type AttachLocalVariablesToTheme = AsyncMessage<AsyncMessageTypes.ATTACH_LOCAL_VARIABLES_TO_THEME, {
  theme: ThemeObject
  tokens: Record<string, AnyTokenList>
}>;
export type AttachLocalVariablesToThemeResult = AsyncMessage<AsyncMessageTypes.ATTACH_LOCAL_VARIABLES_TO_THEME, {
  variableInfo: LocalVariableInfo | null
}>;

export type RenameVariablesAsyncMessage = AsyncMessage<AsyncMessageTypes.RENAME_VARIABLES, {
  tokens: {
    oldName: string;
    newName: string;
  }[]
}>;
export type RenameVariablesAsyncMessageResult = AsyncMessage<AsyncMessageTypes.RENAME_VARIABLES, {
  renameVariableToken: RenameVariableToken[];
}>;

export type UpdateVariablesAsyncMessage = AsyncMessage<AsyncMessageTypes.UPDATE_VARIABLES, {
  payload: UpdateTokenVariablePayload
}>;
export type UpdateVariablesAsyncMessageResult = AsyncMessage<AsyncMessageTypes.UPDATE_VARIABLES>;

export type RemoveRelaunchDataMessage = AsyncMessage<
AsyncMessageTypes.REMOVE_RELAUNCH_DATA,
{
  area: UpdateMode;
}
>;

export type RemoveRelaunchDataMessageResult = AsyncMessage<
AsyncMessageTypes.REMOVE_RELAUNCH_DATA,
{
  totalNodes: number;
}
>;

export type AsyncMessages =
  CreateStylesAsyncMessage
  | RenameStylesAsyncMessage
  | RemoveStylesAsyncMessage
  | CredentialsAsyncMessage
  | ChangedTabsAsyncMessage
  | RemoveSingleCredentialAsyncMessage
  | SetStorageTypeAsyncMessage
  | SetOnboardingExplainerSetsAsyncMessage
  | SetOnboardingExplainerExportSetsAsyncMessage
  | SetOnboardingExplainerInspectAsyncMessage
  | SetOnboardingExplainerSyncProvidersAsyncMessage
  | SetNodeDataAsyncMessage
  | RemoveTokensByValueAsyncMessage
  | RemapTokensAsyncMessage
  | BulkRemapTokensAsyncMessage
  | GotoNodeAsyncMessage
  | SelectNodesAsyncMessage
  | PullStylesAsyncMessage
  | PullVariablesAsyncMessage
  | NotifyAsyncMessage
  | ResizeWindowAsyncMessage
  | CancelOperationAsyncMessage
  | SetShowEmptyGroupsAsyncMessage
  | SetUiAsyncMessage
  | CreateAnnotationAsyncMessage
  | UpdateAsyncMessage
  | GetThemeInfoMessage
  | SetLicenseKeyMessage
  | SetInitialLoadMessage
  | StartupMessage
  | AttachLocalStylesToTheme
  | ResolveStyleInfo
  | SetNoneValuesOnNodeAsyncMessage
  | GetFigmaFontsMessage
  | SetAuthDataMessage
  | SetUsedEmailMessage
  | CreateLocalVariablesAsyncMessage
  | CreateLocalVariablesWithoutModesAsyncMessage
  | ResolveVariableInfo
  | AttachLocalVariablesToTheme
  | RenameVariablesAsyncMessage
  | UpdateVariablesAsyncMessage
  | RemoveRelaunchDataMessage
  | GetLocalStylesMessage;

export type AsyncMessageResults =
  CreateStylesAsyncMessageResult
  | RenameStylesAsyncMessageResult
  | RemoveStylesAsyncMessageResult
  | CredentialsAsyncMessageResult
  | ChangedTabsAsyncMessageResult
  | RemoveSingleCredentialAsyncMessageResult
  | SetStorageTypeAsyncMessageResult
  | SetOnboardingExplainerSetsAsyncMessageResult
  | SetOnboardingExplainerExportSetsAsyncMessageResult
  | SetOnboardingExplainerSyncProvidersAsyncMessageResult
  | SetOnboardingExplainerInspectAsyncMessageResult
  | SetNodeDataAsyncMessageResult
  | RemoveTokensByValueAsyncMessageResult
  | RemapTokensMessageAsyncResult
  | BulkRemapTokensMessageAsyncResult
  | GotoNodeMessageAsyncResult
  | SelectNodesMessageAsyncResult
  | PullStylesAsyncMessageResult
  | PullVariablesMessageResult
  | NotifyAsyncMessageResult
  | ResizeWindowAsyncMessageResult
  | CancelOperationAsyncMessage
  | SetShowEmptyGroupsAsyncMessageResult
  | SetUiAsyncMessageResult
  | CreateAnnotationAsyncMessageResult
  | UpdateAsyncMessageResult
  | GetThemeInfoMessageResult
  | SetLicenseKeyMessageResult
  | SetInitialLoadMessageResult
  | StartupMessageResult
  | AttachLocalStylesToThemeResult
  | ResolveStyleInfoResult
  | SetNoneValuesOnNodeAsyncMessageResult
  | GetFigmaFontsMessageResult
  | SetAuthDataMessageResult
  | SetUsedEmailMessageResult
  | CreateLocalVariablesAsyncMessageResult
  | CreateLocalVariablesWithoutModesAsyncMessageResult
  | ResolveVariableInfoResult
  | AttachLocalVariablesToThemeResult
  | RenameVariablesAsyncMessageResult
  | UpdateVariablesAsyncMessageResult
  | RemoveRelaunchDataMessageResult
  | GetLocalStylesMessageResult;

export type AsyncMessagesMap = {
  [K in AsyncMessageTypes]: Extract<AsyncMessages, { type: K }>
};
export type AsyncMessageResultsMap = {
  [K in AsyncMessageTypes]: Extract<AsyncMessageResults, { type: K }>
};

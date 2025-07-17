import {
  MessageFromPluginTypes,
  PostToUIMessage,
} from '@/types/messages';
import { TokenStore } from '@/types/tokens';
import { SelectionGroup } from '@/types/SelectionGroup';
import { SelectionValue } from '@/types/SelectionValue';
import { UpdateMode } from '@/constants/UpdateMode';
import { AsyncMessageTypes, NotifyAsyncMessage } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { StorageTypeCredentials } from '@/types/StorageType';
import { StyleToCreateToken, VariableToCreateToken } from '@/types/payloads';
import { TokenFormatOptions } from './TokenFormatStoreClass';
import { ApplyVariablesStylesOrRawValues } from '@/constants/ApplyVariablesStyleOrder';
import { ThemeObjectsList } from '@/types/ThemeObjectsList';

export function notifyUI(msg: string, opts?: NotificationOptions) {
  figma.notify(msg, opts);
}

export function notifyToUI(msg: string, opts: NotifyAsyncMessage['opts'] = {}) {
  AsyncMessageChannel.ReactInstance.message({
    type: AsyncMessageTypes.NOTIFY,
    msg,
    opts,
  });
}

export function postToUI(props: PostToUIMessage) {
  figma.ui.postMessage(props);
}

export function notifyNoSelection() {
  postToUI({
    type: MessageFromPluginTypes.NO_SELECTION,
  });
}

export function notifySelection({
  selectionValues,
  mainNodeSelectionValues,
  selectedNodes,
}: {
  selectionValues: SelectionGroup[];
  mainNodeSelectionValues: SelectionValue[];
  selectedNodes: number;
}) {
  postToUI({
    type: MessageFromPluginTypes.SELECTION,
    selectionValues,
    mainNodeSelectionValues,
    selectedNodes,
  });
}

export type SavedSettings = {
  language: string,
  sessionRecording: boolean;
  width: number;
  height: number;
  showEmptyGroups: boolean
  updateMode: UpdateMode;
  updateRemote: boolean;
  updateOnChange: boolean;
  applyVariablesStylesOrRawValue: ApplyVariablesStylesOrRawValues;
  shouldUpdateStyles: boolean;
  variablesColor: boolean;
  variablesNumber: boolean;
  variablesString: boolean;
  variablesBoolean: boolean;
  stylesColor: boolean;
  stylesTypography: boolean;
  stylesEffect: boolean;
  ignoreFirstPartForStyles: boolean;
  createStylesWithVariableReferences: boolean;
  prefixStylesWithThemeName: boolean;
  renameExistingStylesAndVariables: boolean;
  removeStylesAndVariablesWithoutConnection: boolean;
  inspectDeep: boolean;
  shouldSwapStyles: boolean;
  baseFontSize: string;
  aliasBaseFontSize: string;
  storeTokenIdInJsonEditor: boolean;
  tokenFormat: TokenFormatOptions;
};

export function notifyUISettings(
  {
    language,
    sessionRecording,
    width,
    height,
    updateMode,
    updateOnChange,
    applyVariablesStylesOrRawValue,
    shouldUpdateStyles,
    showEmptyGroups,
    variablesColor,
    variablesNumber,
    variablesString,
    variablesBoolean,
    stylesColor,
    stylesTypography,
    stylesEffect,
    ignoreFirstPartForStyles,
    createStylesWithVariableReferences,
    prefixStylesWithThemeName,
    updateRemote = true,
    inspectDeep,
    shouldSwapStyles,
    baseFontSize,
    aliasBaseFontSize,
    storeTokenIdInJsonEditor,
    tokenFormat,
    renameExistingStylesAndVariables,
    removeStylesAndVariablesWithoutConnection,
  }: SavedSettings,
) {
  postToUI({
    type: MessageFromPluginTypes.UI_SETTINGS,
    settings: {
      uiWindow: {
        width,
        height,
        isMinimized: false,
      },
      language,
      sessionRecording,
      updateMode,
      updateRemote,
      updateOnChange,
      applyVariablesStylesOrRawValue,
      shouldUpdateStyles,
      variablesColor,
      variablesBoolean,
      variablesNumber,
      variablesString,
      stylesColor,
      stylesEffect,
      stylesTypography,
      ignoreFirstPartForStyles,
      createStylesWithVariableReferences,
      prefixStylesWithThemeName,
      inspectDeep,
      shouldSwapStyles,
      baseFontSize,
      aliasBaseFontSize,
      storeTokenIdInJsonEditor,
      tokenFormat,
      renameExistingStylesAndVariables,
      removeStylesAndVariablesWithoutConnection,
    },
  });
  postToUI({
    type: MessageFromPluginTypes.SHOW_EMPTY_GROUPS,
    showEmptyGroups,
  });
}

export function notifyAPIProviders(providers: StorageTypeCredentials[]) {
  postToUI({ type: MessageFromPluginTypes.API_PROVIDERS, providers });
}

export function notifyStyleValues(values: Record<string, StyleToCreateToken[]>) {
  postToUI({ type: MessageFromPluginTypes.STYLES, values });
}

export function notifyVariableValues(
  values: Record<string, VariableToCreateToken[]>,
  themes?: ThemeObjectsList,
) {
  postToUI({
    type: MessageFromPluginTypes.VARIABLES,
    values,
    themes,
  });
}

export function notifyRenamedCollections(renamedCollections: [string, string][]) {
  postToUI({
    type: MessageFromPluginTypes.RENAME_COLLECTIONS_AND_MODES,
    renamedCollections,
  });
}

export function notifySetTokens(values: TokenStore) {
  postToUI({ type: MessageFromPluginTypes.SET_TOKENS, values });
}

export function notifyException(error: string, opts = {}) {
  postToUI({
    type: MessageFromPluginTypes.NOTIFY_EXCEPTION,
    error,
    opts,
  });
}

export function trackFromPlugin(title: string, opts = {}) {
  postToUI({
    type: MessageFromPluginTypes.TRACK_FROM_PLUGIN,
    title,
    opts,
  });
}

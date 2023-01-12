import {
  MessageFromPluginTypes,
  PostToUIMessage,
} from '@/types/messages';
import { AnyTokenList, TokenStore } from '@/types/tokens';
import { SelectionGroup } from '@/types/SelectionGroup';
import { SelectionValue } from '@/types/SelectionValue';
import { UpdateMode } from '@/constants/UpdateMode';
import { AsyncMessageTypes, NotifyAsyncMessage } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { StorageTypeCredentials } from '@/types/StorageType';

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
  width: number;
  height: number;
  showEmptyGroups: boolean
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

export function notifyUISettings(
  {
    width,
    height,
    updateMode,
    updateOnChange,
    updateStyles,
    showEmptyGroups,
    ignoreFirstPartForStyles,
    prefixStylesWithThemeName,
    updateRemote = true,
    inspectDeep,
    shouldSwapStyles,
    baseFontSize,
    aliasBaseFontSize,
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
      updateMode,
      updateRemote,
      updateOnChange,
      updateStyles,
      ignoreFirstPartForStyles,
      prefixStylesWithThemeName,
      inspectDeep,
      shouldSwapStyles,
      baseFontSize,
      aliasBaseFontSize,
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

export function notifyStyleValues(values: Record<string, AnyTokenList>) {
  postToUI({ type: MessageFromPluginTypes.STYLES, values });
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

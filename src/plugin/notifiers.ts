import {
  MessageFromPluginTypes,
  PostToUIMessage,
  UserIdFromPluginMessage,
} from '@/types/messages';
import { AnyTokenList, TokenStore } from '@/types/tokens';
import { SelectionGroup } from '@/types/SelectionGroup';
import { SelectionValue } from '@/types/SelectionValue';
import { UpdateMode } from '@/constants/UpdateMode';
import { AsyncMessageTypes, NotifyAsyncMessage } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { StorageType, StorageTypeCredentials } from '@/types/StorageType';

export function notifyUI(msg: string, opts?: NotificationOptions) {
  figma.notify(msg, opts);
}

export function notifyToUI(msg: string, opts: NotifyAsyncMessage['opts'] = {}) {
  AsyncMessageChannel.message({
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
  inspectDeep: boolean;
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
    updateRemote = true,
    inspectDeep,
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
      inspectDeep,
    },
  });
  postToUI({
    type: MessageFromPluginTypes.SHOW_EMPTY_GROUPS,
    showEmptyGroups,
  });
}

export function notifyTokenValues(values: TokenStore) {
  postToUI({ type: MessageFromPluginTypes.TOKEN_VALUES, values });
}

export function notifyNoTokenValues() {
  postToUI({ type: MessageFromPluginTypes.NO_TOKEN_VALUES });
}

export function notifyStorageType(storageType: StorageType) {
  postToUI({ type: MessageFromPluginTypes.RECEIVED_STORAGE_TYPE, storageType });
}

export function notifyAPIProviders(providers: StorageTypeCredentials[]) {
  postToUI({ type: MessageFromPluginTypes.API_PROVIDERS, providers });
}

export function notifyStyleValues(values: Record<string, AnyTokenList>) {
  postToUI({ type: MessageFromPluginTypes.STYLES, values });
}

export function notifyUserId(user: UserIdFromPluginMessage['user']) {
  postToUI({
    type: MessageFromPluginTypes.USER_ID,
    user,
  });
}

export function notifyLicenseKey(licenseKey: string) {
  postToUI({
    type: MessageFromPluginTypes.LICENSE_KEY,
    licenseKey,
  });
}

export function notifyLastOpened(lastOpened: number) {
  postToUI({
    type: MessageFromPluginTypes.RECEIVED_LAST_OPENED,
    lastOpened,
  });
}

export function notifySetTokens(values: TokenStore) {
  postToUI({ type: MessageFromPluginTypes.SET_TOKENS, values });
}

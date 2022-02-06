import { UpdateMode } from '@/types/state';
import { ApiDataType, StorageType } from '@/types/api';
import {
  PostToFigmaMessage,
  MessageFromPluginTypes,
  MessageToPluginTypes,
  PostToUIMessage,
  NotifyToPluginMessage,
  UserIdFromPluginMessage,
} from '@/types/messages';
import store from './store';
import { SelectionGroup, SelectionValue } from '@/types/tokens';

export function postToFigma(props: PostToFigmaMessage) {
  parent.postMessage(
    {
      pluginMessage: props,
    },
    '*',
  );
}

export function notifyUI(msg: string, opts?: NotificationOptions) {
  figma.notify(msg, opts);
}

export function notifyToUI(msg: string, opts: NotifyToPluginMessage['opts'] = {}) {
  postToFigma({
    type: MessageToPluginTypes.NOTIFY,
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

export function notifySelection({ selectionValues, mainNodeSelectionValues }: { selectionValues: SelectionGroup[], mainNodeSelectionValues: SelectionValue[] }) {
  postToUI({
    type: MessageFromPluginTypes.SELECTION,
    selectionValues,
    mainNodeSelectionValues,
  });
}

export function notifyUISettings({
  width,
  height,
  updateMode,
  updateOnChange,
  updateStyles,
  ignoreFirstPartForStyles,
  updateRemote = true,
  inspectDeep,
}: {
  width: number;
  height: number;
  updateMode: UpdateMode;
  updateRemote: boolean;
  updateOnChange: boolean;
  updateStyles: boolean;
  ignoreFirstPartForStyles: boolean;
  inspectDeep: boolean;
}) {
  postToUI({
    type: MessageFromPluginTypes.UI_SETTINGS,
    settings: {
      uiWindow: {
        width,
        height,
      },
      updateMode,
      updateRemote,
      updateOnChange,
      updateStyles,
      ignoreFirstPartForStyles,
      inspectDeep,
    },
  });
}

type Data = {
  nodes: number
  remotes: Set<BaseNode>
};

export function notifyRemoteComponents({ nodes, remotes }: Data) {
  const opts = { timeout: 600 };
  if (nodes > 0 && remotes.size > 0) {
    notifyUI(`Updated ${nodes} nodes, unable to update ${remotes.size} remote components`, opts);
  } else if (nodes > 0 && remotes.size === 0) {
    notifyUI(`Success! Updated ${nodes} nodes`, opts);
  }
  postToUI({
    type: MessageFromPluginTypes.REMOTE_COMPONENTS,
  });

  store.successfulNodes.clear();
  store.remoteComponents.clear();
}

export function notifyTokenValues(values = undefined) {
  postToUI({ type: MessageFromPluginTypes.TOKEN_VALUES, values });
}

export function notifyStorageType(storageType: StorageType) {
  postToUI({ type: MessageFromPluginTypes.RECEIVED_STORAGE_TYPE, storageType });
}

export function notifyAPIProviders(providers: ApiDataType[]) {
  postToUI({ type: MessageFromPluginTypes.API_PROVIDERS, providers });
}

export function notifyStyleValues(values = undefined) {
  postToUI({ type: MessageFromPluginTypes.STYLES, values });
}

export function notifyUserId(user: UserIdFromPluginMessage['user']) {
  postToUI({
    type: MessageFromPluginTypes.USER_ID,
    user,
  });
}

export function notifyLastOpened(lastOpened: number) {
  postToUI({
    type: MessageFromPluginTypes.RECEIVED_LAST_OPENED,
    lastOpened,
  });
}

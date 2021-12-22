import {UpdateMode} from 'Types/state';
import {ApiDataType, StorageType} from 'Types/api';
import {PostToFigmaProps, MessageFromPluginTypes, MessageToPluginTypes} from 'Types/messages';
import store from './store';

export function postToFigma(props: PostToFigmaProps) {
    parent.postMessage(
        {
            pluginMessage: props,
        },
        '*'
    );
}

export function notifyUI(msg, opts?) {
    figma.notify(msg, opts);
}

export function notifyToUI(msg, opts = {}) {
    postToFigma({
        type: MessageToPluginTypes.NOTIFY,
        msg,
        opts,
    });
}

export function postToUI(props) {
    figma.ui.postMessage(props);
}

export function notifyNoSelection() {
    postToUI({
        type: MessageFromPluginTypes.NO_SELECTION,
    });
}

export function notifySelection(nodes = undefined, values = undefined) {
    postToUI({
        type: MessageFromPluginTypes.SELECTION,
        nodes,
        values,
    });
}

export function notifyUISettings({
    width,
    height,
    updateMode,
    updateRemote = true,
    updateOnChange,
    updateStyles,
    ignoreFirstPartForStyles,
}: {
    width: number;
    height: number;
    updateMode: UpdateMode;
    updateRemote: boolean;
    updateOnChange: boolean;
    updateStyles: boolean;
    ignoreFirstPartForStyles: boolean;
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
        },
    });
}

export function notifyRemoteComponents({nodes, remotes}) {
    const opts = {timeout: 600};
    if (nodes > 0 && remotes.length > 0) {
        notifyUI(`Updated ${nodes} nodes, unable to update ${remotes.length} remote components`, opts);
    } else if (nodes > 0 && remotes.length === 0) {
        notifyUI(`Success! Updated ${nodes} nodes`, opts);
    }
    postToUI({
        type: MessageFromPluginTypes.REMOTE_COMPONENTS,
        values: {
            nodes,
            remotes,
        },
    });

    store.successfulNodes = [];
    store.remoteComponents = [];
}

export function notifyTokenValues(values = undefined) {
    postToUI({type: MessageFromPluginTypes.TOKEN_VALUES, values});
}

export function notifyStorageType(storageType: StorageType) {
    postToUI({type: MessageFromPluginTypes.RECEIVED_STORAGE_TYPE, storageType});
}

export function notifyAPIProviders(providers: ApiDataType[]) {
    postToUI({type: MessageFromPluginTypes.API_PROVIDERS, providers});
}

export function notifyStyleValues(values = undefined) {
    postToUI({type: MessageFromPluginTypes.STYLES, values});
}

export function notifyUserId(user: {userId: string; figmaId: string; name: string}) {
    postToUI({
        type: MessageFromPluginTypes.USER_ID,
        user,
    });
}

export function notifyLastOpened(lastOpened: Date) {
    postToUI({
        type: MessageFromPluginTypes.RECEIVED_LAST_OPENED,
        lastOpened,
    });
}

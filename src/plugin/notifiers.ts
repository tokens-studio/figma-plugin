import {apiData, StorageType} from '../app/store/types';
import store from './store';

export function postToFigma(props) {
    parent.postMessage(
        {
            pluginMessage: props,
        },
        '*'
    );
}

export function notifyUI(msg, opts = {}) {
    figma.notify(msg, opts);
}

export function notifyToUI(msg, opts = {}) {
    postToFigma({
        type: 'notify',
        msg,
        opts,
    });
}

export function postToUI(props) {
    figma.ui.postMessage(props);
}

export function notifyNoSelection() {
    postToUI({
        type: 'noselection',
    });
}

export function notifySelection(nodes = undefined, values = undefined) {
    postToUI({
        type: 'selection',
        nodes,
        values,
    });
}

export function notifyRemoteComponents({nodes, remotes}) {
    const opts = {timeout: 600};
    if (nodes > 0 && remotes.length > 0) {
        notifyUI(`Updated ${nodes} nodes, unable to update ${remotes.length} remote components`, opts);
    } else if (nodes > 0 && remotes.length === 0) {
        notifyUI(`Success! Updated ${nodes} nodes`, opts);
    } else if (nodes === 0) {
        notifyUI(`No nodes updated`, opts);
    } else {
        notifyUI(`No nodes with connected tokens found`, opts);
    }
    postToUI({
        type: 'remotecomponents',
        values: {
            nodes,
            remotes,
        },
    });

    store.successfulNodes = [];
    store.remoteComponents = [];
}

export function notifyTokenValues(values = undefined) {
    postToUI({type: 'tokenvalues', values});
}

export function notifyStorageType(storageType: StorageType) {
    postToUI({type: 'receivedStorageType', storageType});
}

export function notifyAPIProviders(providers: apiData[]) {
    postToUI({type: 'apiProviders', providers});
}

export function notifyStyleValues(values = undefined) {
    postToUI({type: 'styles', values});
}

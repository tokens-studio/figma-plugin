import store from './store';

export function notifyNoSelection() {
    figma.ui.postMessage({
        type: 'noselection',
    });
}

export function notifySelection(nodes = undefined, values = undefined) {
    figma.ui.postMessage({
        type: 'selection',
        nodes,
        values,
    });
}

export function notifyRemoteComponents({nodes, remotes}) {
    const opts = {timeout: 600};
    if (nodes > 0 && remotes.length > 0) {
        figma.notify(`Updated ${nodes} nodes, unable to update ${remotes.length} remote components`, opts);
    } else if (nodes > 0 && remotes.length === 0) {
        figma.notify(`Success! Updated ${nodes} nodes`, opts);
    } else if (nodes === 0) {
        figma.notify(`No nodes updated`, opts);
    } else {
        figma.notify(`No nodes with connected tokens found`, opts);
    }
    figma.ui.postMessage({
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
    figma.ui.postMessage({
        type: 'tokenvalues',
        values,
    });
}

export function notifyStyleValues(values = undefined) {
    figma.ui.postMessage({
        type: 'styles',
        values,
    });
}

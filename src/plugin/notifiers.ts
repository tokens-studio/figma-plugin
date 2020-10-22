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

export function fetchPluginData(node) {
    const previousValues = node.getPluginData('values');
    if (!previousValues) return;
    return JSON.parse(previousValues);
}

export function sendPluginValues(nodes) {
    if (nodes.length > 1) {
        notifySelection(nodes[0].id);
    } else {
        const pluginValues = fetchPluginData(nodes[0]);
        if (pluginValues) {
            notifySelection(nodes[0].id, pluginValues);
        } else {
            notifySelection(nodes[0].id);
        }
    }
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

export function updatePluginData(nodes, values) {
    nodes.map((item) => {
        const currentVals = fetchPluginData(item);
        const newVals = Object.assign(currentVals || {}, values);
        Object.entries(newVals).forEach(([key, value]) => {
            if (value === 'delete') {
                delete newVals[key];
            }
        });
        try {
            if (Object.keys(newVals).length === 0 && newVals.constructor === Object) {
                if (item.type !== 'INSTANCE') item.setRelaunchData({});
            } else if (item.type !== 'INSTANCE')
                item.setRelaunchData({
                    edit: Object.keys(newVals).join(', '),
                });
        } catch (e) {
            console.error({e});
        }
        item.setPluginData('values', JSON.stringify(newVals));
    });
}

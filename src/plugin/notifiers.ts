import store from './store';
import properties from '../config/properties';

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

export function fetchOldPluginData(node) {
    const previousValues = node.getPluginData('values');
    if (!previousValues) {
        return;
    }
    return JSON.parse(previousValues);
}

export function fetchPluginData(node, value: string) {
    return node.getPluginData(value);
}

export function fetchAllPluginData(node) {
    const pluginData = Object.keys(properties).reduce((prev, prop) => {
        const data = fetchPluginData(node, prop);
        if (data) prev.push([prop, JSON.parse(data)]);
        return prev;
    }, []);

    if (pluginData.length == 1 && pluginData[0][0] === 'values') {
        return pluginData[0][1];
    }
    if (pluginData.length > 0) {
        return Object.fromEntries(pluginData);
    }
    return null;
}

export function sendPluginValues(nodes, values?) {
    let pluginValues = values;

    if (nodes.length > 1) {
        notifySelection(nodes[0].id);
    } else {
        if (!pluginValues) {
            pluginValues = fetchAllPluginData(nodes[0]);
        }
        notifySelection(nodes[0].id, pluginValues);
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

export function removePluginData(nodes, key?) {
    nodes.map((node) => {
        try {
            node.setRelaunchData({});
        } finally {
            if (key) {
                node.setPluginData(key, '');
            } else {
                Object.keys(properties).forEach((prop) => {
                    node.setPluginData(prop, '');
                });
            }
            node.setPluginData('values', '');
            store.successfulNodes.push(node);
        }
    });
}

export function updatePluginData(nodes, values) {
    nodes.map((node) => {
        const currentValuesOnNode = fetchAllPluginData(node);
        const newValuesOnNode = Object.assign(currentValuesOnNode || {}, values);
        Object.entries(newValuesOnNode).forEach(([key, value]) => {
            if (value === 'delete') {
                delete newValuesOnNode[key];
                removePluginData([node], key);
            } else {
                node.setPluginData(key, JSON.stringify(value));
            }
        });
        try {
            if (node.type !== 'INSTANCE') {
                if (Object.keys(newValuesOnNode).length === 0 && newValuesOnNode.constructor === Object) {
                    try {
                        node.setRelaunchData({});
                    } catch (e) {
                        console.error('Updating relaunchData on instance children not supported.');
                    }
                } else {
                    try {
                        node.setRelaunchData({
                            edit: Object.keys(newValuesOnNode).join(', '),
                        });
                    } catch (e) {
                        console.error('Updating relaunchData on instance children not supported.');
                    }
                }
            }
        } finally {
            node.setPluginData('values', '');
        }
    });
}

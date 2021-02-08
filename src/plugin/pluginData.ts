import {removeValuesFromNode} from './updateNode';
import {notifySelection} from './notifiers';
import store from './store';
import properties from '../config/properties';

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
    const pluginData = [];
    let i = 0;
    const len = Object.keys(properties).length;
    while (i < len) {
        const prop = Object.keys(properties)[i];
        const data = fetchPluginData(node, prop);
        if (data) pluginData.push([prop, JSON.parse(data)]);

        i += 1;
    }

    if (pluginData.length === 1 && pluginData[0][0] === 'values') {
        return node ? pluginData[0][1] : pluginData[0][1];
    }
    if (pluginData.length > 0) {
        return Object.fromEntries(pluginData);
    }
    return null;
}

export function findAllWithData({pageOnly = false}) {
    const root = pageOnly ? figma.currentPage : figma.root;
    const nodes = root.findAll((node): any => {
        const pluginValues = fetchAllPluginData(node);
        if (pluginValues) return node;
    });
    return nodes;
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
export function removePluginData(nodes, key?) {
    nodes.map((node) => {
        try {
            node.setRelaunchData({});
        } finally {
            if (key) {
                node.setPluginData(key, '');
                removeValuesFromNode(node, key);
            } else {
                Object.keys(properties).forEach((prop) => {
                    node.setPluginData(prop, '');
                    removeValuesFromNode(node, prop);
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

import {UpdateMode} from 'Types/state';
import {notifySelection} from './notifiers';
import store from './store';
import properties from '../config/properties';
import removeValuesFromNode from './removeValuesFromNode';

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
        if (data) {
            switch (prop) {
                // Pre-Version 53 had horizontalPadding and verticalPadding.
                case 'horizontalPadding':
                    pluginData.push(['paddingLeft', JSON.parse(data)]);
                    pluginData.push(['paddingRight', JSON.parse(data)]);
                    break;
                case 'verticalPadding':
                    pluginData.push(['paddingTop', JSON.parse(data)]);
                    pluginData.push(['paddingBottom', JSON.parse(data)]);
                    break;
                default:
                    pluginData.push([prop, JSON.parse(data)]);
                    break;
            }
        }

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

function findPluginDataTraversal(node) {
    const data = fetchAllPluginData(node);
    const nodes = [];
    if (data) nodes.push(node);
    if (node.children) {
        node.children.forEach((child) => {
            nodes.push(...findPluginDataTraversal(child));
        });
    }
    return nodes;
}

export function findAllWithData({updateMode}: {updateMode: UpdateMode}) {
    switch (updateMode) {
        case UpdateMode.PAGE: {
            return figma.currentPage.findAll((node): any => {
                const pluginValues = fetchAllPluginData(node);
                if (pluginValues) return node;
            });
        }
        case UpdateMode.SELECTION: {
            const nodesWithData = figma.currentPage.selection.reduce((acc, cur) => {
                const nodes = findPluginDataTraversal(cur);
                acc.push(...nodes);
                return acc;
            }, []);
            return nodesWithData;
        }
        default: {
            return figma.root.findAll((node): any => {
                const pluginValues = fetchAllPluginData(node);
                if (pluginValues) return node;
            });
        }
    }
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
                node.setSharedPluginData('tokens', key, '');
                // TODO: Introduce setting asking user if values should be removed?
                removeValuesFromNode(node, key);
            } else {
                Object.keys(properties).forEach((prop) => {
                    node.setPluginData(prop, '');
                    node.setSharedPluginData('tokens', prop, '');
                    // TODO: Introduce setting asking user if values should be removed?
                    removeValuesFromNode(node, prop);
                });
            }
            node.setPluginData('values', '');
            node.setSharedPluginData('tokens', 'values', '');
            store.successfulNodes.push(node);
        }
    });
}

export function updatePluginData(nodes, values) {
    nodes.map((node) => {
        const currentValuesOnNode = fetchAllPluginData(node);
        const newValuesOnNode = Object.assign(currentValuesOnNode || {}, values);
        Object.entries(newValuesOnNode).forEach(([key, value]) => {
            switch (value) {
                case 'delete':
                    delete newValuesOnNode[key];
                    removePluginData([node], key);
                    break;
                // Pre-Version 53 had horizontalPadding and verticalPadding.
                case 'horizontalPadding':
                    node.setPluginData('paddingLeft', JSON.stringify(value));
                    node.setSharedPluginData('tokens', 'paddingLeft', JSON.stringify(value));
                    node.setPluginData('paddingRight', JSON.stringify(value));
                    node.setSharedPluginData('tokens', 'paddingRight', JSON.stringify(value));
                    break;
                case 'verticalPadding':
                    node.setPluginData('paddingTop', JSON.stringify(value));
                    node.setSharedPluginData('tokens', 'paddingTop', JSON.stringify(value));
                    node.setPluginData('paddingBottom', JSON.stringify(value));
                    node.setSharedPluginData('tokens', 'paddingBottom', JSON.stringify(value));
                    break;
                default:
                    node.setPluginData(key, JSON.stringify(value));
                    node.setSharedPluginData('tokens', key, JSON.stringify(value));
                    break;
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
            node.setSharedPluginData('tokens', 'values', '');
        }
    });
}

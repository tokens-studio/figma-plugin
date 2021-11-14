import {UpdateMode} from 'Types/state';
import {notifySelection} from './notifiers';
import store from './store';
import properties from '../config/properties';
import removeValuesFromNode from './removeValuesFromNode';

export function fetchPluginData(node, value: string) {
    return node.getPluginData(value);
}

// {
//     fill: colors.blue.500
//     nodes: [1,2,3]
// },
// {
//     fill: colors.blue.300
//     nodes: [4,5,6]
// }
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

export function fetchSelectionPluginData(nodes) {
    const pluginData = nodes.map((node) => {
        return {node: node.id, values: fetchAllPluginData(node)};
    });

    // turn this

    // [
    //     {node: 1, values: {fill: 'colors.blue.500'}},
    //     {node: 2, values: {fill: 'colors.blue.500'}},
    //     {node: 3, values: {fill: 'colors.red.500'}},
    // ]

    // into this

    // [
    //     { fill: 'colors.blue.500', nodes: [1, 2, 3] },
    //     { fill: 'colors.red.500', nodes: [1, 2, 3] },
    // ]

    const grouped = pluginData.reduce((acc, curr) => {
        const {node, values} = curr;

        if (values) {
            Object.entries(values).forEach(([key, value]) => {
                const existing = acc.find((item) => item[key] === value);

                if (existing) {
                    existing.nodes.push(node);
                } else {
                    acc.push({[key]: value, type: key, nodes: [node]});
                }
            });
        }

        return acc;
    }, []);

    console.log('grouped', grouped);
    return grouped;
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

    if (!pluginValues) {
        pluginValues = fetchSelectionPluginData(nodes);
    }
    console.log('pluginValues', nodes, pluginValues);

    notifySelection(pluginValues);
}

export function removePluginData({
    nodes,
    key,
    shouldRemoveValues = true,
}: {
    nodes: any[];
    key?: string;
    shouldRemoveValues?: boolean;
}) {
    console.log('removePluginData', nodes, key, shouldRemoveValues);

    nodes.forEach((node) => {
        try {
            node.setRelaunchData({});
        } finally {
            if (key) {
                node.setPluginData(key, '');
                node.setSharedPluginData('tokens', key, '');
                if (shouldRemoveValues) {
                    removeValuesFromNode(node, key);
                }
            } else {
                Object.keys(properties).forEach((prop) => {
                    node.setPluginData(prop, '');
                    node.setSharedPluginData('tokens', prop, '');
                    if (shouldRemoveValues) {
                        removeValuesFromNode(node, prop);
                    }
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
                    removePluginData({nodes: [node], key});
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

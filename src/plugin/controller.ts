import {hexToFigmaRGB} from '@figma-plugin/helpers';

const Dot = require('dot-object');
const objectPath = require('object-path');

const dot = new Dot('/');

let remoteComponents = [];
let successfulNodes = [];

figma.showUI(__html__, {
    width: 400,
    height: 600,
});

function notifyNoSelection() {
    figma.ui.postMessage({
        type: 'noselection',
    });
}

function notifyRemoteComponents({nodes, remotes}) {
    const opts = {timeout: 600};
    if (nodes > 0 && remotes.length > 0) {
        figma.notify(`Updated ${nodes} nodes, unable to update ${remotes.length} remote components`, opts);
    } else if (nodes > 0 && remotes.length == 0) {
        figma.notify(`Success! Updated ${nodes} nodes`, opts);
    } else if (nodes == 0) {
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
    successfulNodes = [];
    remoteComponents = [];
}

function notifySelection(nodes = undefined, values = undefined) {
    figma.ui.postMessage({
        type: 'selection',
        nodes,
        values,
    });
}

function fetchPluginData(node) {
    const previousValues = node.getPluginData('values');
    if (!previousValues) return;
    return JSON.parse(previousValues);
}

function sendPluginValues(nodes) {
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

function notifyTokenValues(values = undefined) {
    figma.ui.postMessage({
        type: 'tokenvalues',
        values,
    });
}

function updatePluginData(nodes, values) {
    nodes.map((item) => {
        const currentVals = fetchPluginData(item);
        const newVals = Object.assign(currentVals || {}, values);
        Object.entries(newVals).forEach(([key, value]) => {
            if (value === 'delete') {
                delete newVals[key];
            }
        });
        if (Object.keys(newVals).length === 0 && newVals.constructor === Object) {
            item.setRelaunchData({});
        } else {
            item.setRelaunchData({
                edit: Object.keys(newVals).join(', '),
            });
        }
        item.setPluginData('values', JSON.stringify(newVals));
    });
}

const findAllWithPluginData = (arr) => {
    return arr.reduce((prev, el) => {
        if (el.masterComponent?.getPluginData('values')) {
            if (el.masterComponent.remote) {
                remoteComponents.push(el);
            } else {
                prev.push(el.masterComponent);
            }
            return prev;
        }
        if (el.getPluginData('values')) {
            prev.push(el);
        }
        if (el.children) {
            prev.push(...findAllWithPluginData(el.children));
        }
        return prev;
    }, []);
};

const mapValuesToTokens = (object, values) => {
    const array = Object.entries(values).map(([key, value]) => ({[key]: objectPath.get(object, value)}));
    array.map((item) => ({[item.key]: item.value}));
    return Object.assign({}, ...array);
};

const setValuesOnNode = (node, values, data) => {
    if (values.borderRadius) {
        if (typeof node.cornerRadius !== 'undefined') {
            node.cornerRadius = Number(values.borderRadius || values.borderRadiusTopLeft);
        }
    }
    if (values.borderRadiusTopLeft) {
        if (typeof node.topLeftRadius !== 'undefined') {
            node.topLeftRadius = Number(values.borderRadiusTopLeft);
        }
    }
    if (values.borderRadiusTopRight) {
        if (typeof node.topRightRadius !== 'undefined') {
            node.topRightRadius = Number(values.borderRadiusTopRight);
        }
    }
    if (values.borderRadiusBottomRight) {
        if (typeof node.bottomRightRadius !== 'undefined') {
            node.bottomRightRadius = Number(values.borderRadiusBottomRight);
        }
    }
    if (values.borderRadiusBottomLeft) {
        if (typeof node.bottomLeftRadius !== 'undefined') {
            node.bottomLeftRadius = Number(values.borderRadiusBottomLeft);
        }
    }
    if (values.opacity) {
        if (typeof node.opacity !== 'undefined') {
            let num;
            if (values.opacity.match(/(\d+%)/)) {
                num = values.opacity.match(/(\d+%)/)[0].slice(0, -1) / 100;
            } else {
                num = Number(values.opacity);
            }
            node.opacity = num;
        }
    }
    if (values.width) {
        if (typeof node.resize !== 'undefined') {
            node.resize(Number(values.width), node.height);
        }
    }
    if (values.height) {
        if (typeof node.resize !== 'undefined') {
            node.resize(node.width, Number(values.height));
        }
    }
    if (values.fill) {
        if (typeof node.fills !== 'undefined') {
            const paints = figma.getLocalPaintStyles();
            const path = data.fill.split('.');
            const pathname = path.slice(1, path.length).join('/');
            const matchingStyles = paints.filter((n) => n.name === pathname);
            if (matchingStyles.length) {
                matchingStyles[0].paints = [{color: hexToFigmaRGB(values.fill), type: 'SOLID'}];
                node.fillStyleId = matchingStyles[0].id;
            } else {
                node.fills = [{type: 'SOLID', color: hexToFigmaRGB(values.fill)}];
            }
        }
    }
    if (values.border) {
        if (typeof node.strokes !== 'undefined') {
            const paints = figma.getLocalPaintStyles();
            const path = data.border.split('.');
            const pathname = path.slice(1, path.length).join('/');
            const matchingStyles = paints.filter((n) => n.name === pathname);
            if (matchingStyles.length) {
                matchingStyles[0].paints = [{color: hexToFigmaRGB(values.border), type: 'SOLID'}];
                node.strokeStyleId = matchingStyles[0].id;
            } else {
                node.strokes = [{type: 'SOLID', color: hexToFigmaRGB(values.border)}];
            }
        }
    }
    if (values.spacing) {
        if (typeof node.horizontalPadding !== 'undefined') {
            node.horizontalPadding = Number(values.spacing);
            node.verticalPadding = Number(values.spacing);
            node.itemSpacing = Number(values.spacing);
        }
    }
    if (values.horizontalPadding) {
        if (typeof node.horizontalPadding !== 'undefined') {
            node.horizontalPadding = Number(values.horizontalPadding);
        }
    }
    if (values.verticalPadding) {
        if (typeof node.verticalPadding !== 'undefined') {
            node.verticalPadding = Number(values.verticalPadding);
        }
    }
    if (values.itemSpacing) {
        if (typeof node.itemSpacing !== 'undefined') {
            node.itemSpacing = Number(values.itemSpacing);
        }
    }
};

const updateNodes = (nodes, tokens) => {
    console.log('UPDATING NODES', tokens);
    const nodesWithData = findAllWithPluginData(nodes);
    console.log('nodes with data', nodesWithData, tokens);
    nodesWithData.forEach((node) => {
        const data = fetchPluginData(node);
        if (data) {
            const mappedValues = mapValuesToTokens(tokens, data);
            setValuesOnNode(node, mappedValues, data);
        }
    });
    successfulNodes.push(...nodesWithData);
};

const setTokenData = (data) => {
    console.log('SETTING PLUGIN DATA ON ROOT', data);
    figma.root.setSharedPluginData('tokens', 'version', '0.3');
    figma.root.setSharedPluginData('tokens', 'values', JSON.stringify(data));
};

const getTokenData = () => {
    const value = figma.root.getSharedPluginData('tokens', 'values');
    const version = figma.root.getSharedPluginData('tokens', 'version');
    if (value) {
        const parsedValues = JSON.parse(value);
        console.log({parsedValues});
        return {values: parsedValues, version};
    }
};

const goToNode = (id) => {
    const node = figma.getNodeById(id);
    if (node?.type === 'INSTANCE') {
        figma.currentPage.selection = [node];
        figma.viewport.scrollAndZoomIntoView([node]);
    }
};

const removePluginData = (nodes) => {
    nodes.map((item) => {
        item.setRelaunchData({});
        item.setPluginData('values', '');
        successfulNodes.push(item);
    });
};

const updateStyles = (tokens, shouldCreate = false) => {
    if (!tokens.colors) return;
    const cols = dot.dot(tokens.colors);
    const paints = figma.getLocalPaintStyles();
    Object.entries(cols).map(([key, value]) => {
        const matchingStyle = paints.filter((n) => n.name === key);
        if (typeof value === 'string') {
            if (matchingStyle.length) {
                matchingStyle[0].paints = [{color: hexToFigmaRGB(value), type: 'SOLID'}];
            } else if (shouldCreate) {
                const newStyle = figma.createPaintStyle();
                newStyle.paints = [{color: hexToFigmaRGB(value), type: 'SOLID'}];
                newStyle.name = key;
            }
        }
    });
};

figma.on('selectionchange', () => {
    const nodes = figma.currentPage.selection;
    if (!nodes.length) {
        notifyNoSelection();
        return;
    }
    sendPluginValues(nodes);
});

figma.ui.onmessage = (msg) => {
    if (msg.type === 'initiate') {
        const previousTokens = getTokenData();
        notifyTokenValues(previousTokens);

        const nodes = figma.currentPage.selection;

        if (!nodes.length) {
            notifyNoSelection();
            return;
        }
        sendPluginValues(nodes);
        return;
    }

    if (msg.type === 'set-node-data') {
        console.log('SETTING NODE DATA', msg.values, msg.tokens);
        try {
            updatePluginData(figma.currentPage.selection, msg.values);
            updateNodes(figma.currentPage.selection, msg.tokens);
            sendPluginValues(figma.currentPage.selection);
        } catch (e) {
            console.error(e);
        }
        notifyRemoteComponents({nodes: successfulNodes.length, remotes: remoteComponents});
        return;
    }

    if (msg.type === 'remove-node-data') {
        try {
            removePluginData(figma.currentPage.selection);
            sendPluginValues(figma.currentPage.selection);
        } catch (e) {
            console.error(e);
        }
        notifyRemoteComponents({nodes: successfulNodes.length, remotes: remoteComponents});
        return;
    }

    if (msg.type === 'create-styles') {
        try {
            updateStyles(msg.tokens, true);
        } catch (e) {
            console.error(e);
        }
        return;
    }

    if (msg.type === 'update') {
        console.log('should update', msg);

        setTokenData(msg.tokenValues);
        updateStyles(msg.tokens, false);
        updateNodes(figma.currentPage.children, msg.tokens);
        notifyRemoteComponents({nodes: successfulNodes.length, remotes: remoteComponents});
        return;
    }
    if (msg.type === 'gotonode') {
        goToNode(msg.id);
        return;
    }

    figma.closePlugin();
};

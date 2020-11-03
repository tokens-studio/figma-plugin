/* eslint-disable no-param-reassign */
import {convertToFigmaColor} from './helpers';
import {pullStyles, updateStyles, setTextValuesOnTarget} from './styles';
import store from './store';
import {
    notifyNoSelection,
    sendPluginValues,
    notifyTokenValues,
    updatePluginData,
    notifyRemoteComponents,
    fetchAllPluginData,
    removePluginData,
} from './notifiers';

const objectPath = require('object-path');

figma.showUI(__html__, {
    width: 400,
    height: 600,
});

const mapValuesToTokens = (object, values) => {
    const array = Object.entries(values).map(([key, value]) => ({[key]: objectPath.get(object, value)}));
    array.map((item) => ({[item.key]: item.value}));
    return Object.assign({}, ...array);
};

const setValuesOnNode = async (node, values, data) => {
    // BORDER RADIUS
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

    // BORDER WIDTH
    if (values.borderWidth) {
        // Has to be larger than 0
        if (typeof node.strokeWeight !== 'undefined' && Number(values.borderWidth) >= 0) {
            node.strokeWeight = Number(values.borderWidth);
        }
    }

    // OPACITY
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

    // SIZING: WIDTH
    if (values.width) {
        if (typeof node.resize !== 'undefined') {
            node.resize(Number(values.width), node.height);
        }
    }

    // SIZING: HEIGHT
    if (values.height) {
        if (typeof node.resize !== 'undefined') {
            node.resize(node.width, Number(values.height));
        }
    }

    // FILL
    if (values.fill) {
        if (typeof node.fills !== 'undefined') {
            const paints = figma.getLocalPaintStyles();
            const path = data.fill.split('.');
            const pathname = path.slice(1, path.length).join('/');
            const matchingStyles = paints.filter((n) => n.name === pathname);
            const {color, opacity} = convertToFigmaColor(values.fill);
            if (matchingStyles.length) {
                // matchingStyles[0].paints = [{color, opacity, type: 'SOLID'}];
                node.fillStyleId = matchingStyles[0].id;
            } else {
                node.fills = [{type: 'SOLID', color, opacity}];
            }
        }
    }

    // TYPOGRAPHY
    // Either set typography or individual values, if typography is present we prefer that.
    if (values.typography) {
        if (node.type === 'TEXT') {
            const styles = figma.getLocalTextStyles();
            const path = data.typography.split('.'); // extract to helper fn
            const pathname = path.slice(1, path.length).join('/');
            const matchingStyles = styles.filter((n) => n.name === pathname);

            if (matchingStyles.length) {
                node.textStyleId = matchingStyles[0].id;
            } else {
                setTextValuesOnTarget(node, values.typography);
            }
        }
    } else if (values.fontFamilies || values.fontWeights || values.lineHeights || values.fontSizes) {
        if (node.type === 'TEXT') {
            setTextValuesOnTarget(node, {
                fontFamily: values.fontFamilies,
                fontWeight: values.fontWeights,
                lineHeight: values.lineHeights,
                fontSize: values.fontSizes,
            });
        }
    }

    // BORDER WIDTH
    if (values.border) {
        if (typeof node.strokes !== 'undefined') {
            const paints = figma.getLocalPaintStyles();
            const path = data.border.split('.');
            const pathname = path.slice(1, path.length).join('/');
            const matchingStyles = paints.filter((n) => n.name === pathname);
            const {color, opacity} = convertToFigmaColor(values.border);

            if (matchingStyles.length) {
                matchingStyles[0].paints = [{color, opacity, type: 'SOLID'}];
                node.strokeStyleId = matchingStyles[0].id;
            } else {
                node.strokes = [{type: 'SOLID', color, opacity}];
            }
        }
    }

    // SPACING
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
    const returnedValues = nodes.map((node) => {
        const data = fetchAllPluginData(node);
        if (data) {
            const mappedValues = mapValuesToTokens(tokens, data);
            setValuesOnNode(node, mappedValues, data);
            store.successfulNodes.push(node);
            return data;
        }
    });
    return returnedValues[0];
};

const setTokenData = (data) => {
    figma.root.setSharedPluginData('tokens', 'version', '0.5');
    figma.root.setSharedPluginData('tokens', 'values', JSON.stringify(data));
};

const getTokenData = () => {
    const value = figma.root.getSharedPluginData('tokens', 'values');
    const version = figma.root.getSharedPluginData('tokens', 'version');
    if (value) {
        const parsedValues = JSON.parse(value);
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

figma.on('selectionchange', () => {
    const nodes = figma.currentPage.selection;
    if (!nodes.length) {
        notifyNoSelection();
        return;
    }
    sendPluginValues(nodes);
});

const findAllWithData = () => {
    console.log('finding all');
    return figma.root.findAll((node) => {
        const pluginValues = fetchAllPluginData(node);
        if (pluginValues) return node;
    });
};

figma.ui.onmessage = async (msg) => {
    switch (msg.type) {
        case 'initiate':
            notifyTokenValues(getTokenData());
            updatePluginData(findAllWithData(), getTokenData());

            if (!figma.currentPage.selection.length) {
                notifyNoSelection();
                return;
            }
            sendPluginValues(figma.currentPage.selection);
            return;
        case 'set-node-data':
            try {
                updatePluginData(figma.currentPage.selection, msg.values);
                sendPluginValues(figma.currentPage.selection, updateNodes(figma.currentPage.selection, msg.tokens));
            } catch (e) {
                console.error(e);
            }
            // notifyRemoteComponents({nodes: store.successfulNodes.length, remotes: store.remoteComponents});
            return;

        case 'remove-node-data':
            try {
                removePluginData(figma.currentPage.selection);
                sendPluginValues(figma.currentPage.selection);
            } catch (e) {
                console.error(e);
            }
            notifyRemoteComponents({nodes: store.successfulNodes.length, remotes: store.remoteComponents});
            return;
        case 'create-styles':
            try {
                updateStyles(msg.tokens, true);
            } catch (e) {
                console.error(e);
            }
            return;
        case 'update':
            setTokenData(msg.tokenValues);
            updateStyles(msg.tokens, false);
            updateNodes(findAllWithData(), msg.tokens);
            notifyRemoteComponents({nodes: store.successfulNodes.length, remotes: store.remoteComponents});
            return;
        case 'gotonode':
            goToNode(msg.id);
            break;
        case 'pull-styles':
            pullStyles(msg.styleTypes);
            break;

        default:
    }
};

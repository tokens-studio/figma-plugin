import {convertToFigmaColor} from './helpers';
import {fetchAllPluginData} from './pluginData';
import {setTextValuesOnTarget} from './styles';
import store from './store';
const objectPath = require('object-path');
import * as pjs from '../../package.json';

export function updateNodes(nodes, tokens) {
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
}

export function mapValuesToTokens(object, values) {
    const array = Object.entries(values).map(([key, value]) => ({[key]: objectPath.get(object, value)}));
    array.map((item) => ({[item.key]: item.value}));
    return Object.assign({}, ...array);
}

export function setTokenData(tokens) {
    figma.root.setSharedPluginData('tokens', 'version', pjs.version);
    figma.root.setSharedPluginData('tokens', 'values', JSON.stringify(tokens));
}

export function getTokenData() {
    const values = figma.root.getSharedPluginData('tokens', 'values');
    const version = figma.root.getSharedPluginData('tokens', 'version');
    if (values) {
        const parsedValues = JSON.parse(values);
        return {values: parsedValues, version};
    }
}

export function goToNode(id) {
    const node = figma.getNodeById(id);
    if (node?.type === 'INSTANCE') {
        figma.currentPage.selection = [node];
        figma.viewport.scrollAndZoomIntoView([node]);
    }
}

export async function setValuesOnNode(node, values, data) {
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
    if (values.fill && typeof values.fill === 'string') {
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
}

export async function removeValuesFromNode(node, prop) {
    // BORDER RADIUS
    switch (prop) {
        case 'borderRadius':
            if (typeof node.cornerRadius !== 'undefined') {
                node.cornerRadius = 0;
            }
            break;
        case 'borderRadiusTopLeft':
            if (typeof node.cornerRadius !== 'undefined') {
                node.topLeftRadius = 0;
            }
            break;
        case 'borderRadiusTopRight':
            if (typeof node.cornerRadius !== 'undefined') {
                node.topRightRadius = 0;
            }
            break;
        case 'borderRadiusBottomRight':
            if (typeof node.cornerRadius !== 'undefined') {
                node.bottomRightRadius = 0;
            }
            break;
        case 'borderRadiusBottomLeft':
            if (typeof node.cornerRadius !== 'undefined') {
                node.bottomLeftRadius = 0;
            }
            break;
        case 'borderWidth':
            if (typeof node.strokeWeight !== 'undefined') {
                node.strokeWeight = 0;
            }
            break;
        case 'opacity':
            if (typeof node.opacity !== 'undefined') {
                node.opacity = 1;
            }
            break;
        case 'fill':
            if (typeof node.fills !== 'undefined') {
                node.fills = [];
            }
            break;
        case 'border':
            if (typeof node.strokes !== 'undefined') {
                node.strokes = [];
            }
            break;
        case 'spacing':
            if (typeof node.horizontalPadding !== 'undefined') {
                node.horizontalPadding = 0;
                node.verticalPadding = 0;
                node.itemSpacing = 0;
            }
            break;
        case 'horizontalPadding':
            if (typeof node.horizontalPadding !== 'undefined') {
                node.horizontalPadding = 0;
            }
            break;
        case 'verticalPadding':
            if (typeof node.verticalPadding !== 'undefined') {
                node.verticalPadding = 0;
            }
            break;
        case 'itemSpacing':
            if (typeof node.itemSpacing !== 'undefined') {
                node.itemSpacing = 0;
            }
            break;
    }
}

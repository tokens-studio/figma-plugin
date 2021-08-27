export default async function removeValuesFromNode(node, prop) {
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
        case 'boxShadow':
            if (typeof node.effects !== 'undefined') {
                node.effects = node.effects.filter((effect) => effect.type !== 'DROP_SHADOW');
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
            if (typeof node.paddingLeft !== 'undefined') {
                node.paddingLeft = 0;
                node.paddingRight = 0;
                node.paddingTop = 0;
                node.paddingBottom = 0;
                node.itemSpacing = 0;
            }
            break;
        case 'paddingTop':
            if (typeof node.paddingTop !== 'undefined') {
                node.paddingTop = 0;
            }
            break;
        case 'paddingRight':
            if (typeof node.paddingRight !== 'undefined') {
                node.paddingRight = 0;
            }
            break;
        case 'paddingBottom':
            if (typeof node.paddingBottom !== 'undefined') {
                node.paddingBottom = 0;
            }
            break;
        case 'paddingLeft':
            if (typeof node.paddingLeft !== 'undefined') {
                node.paddingLeft = 0;
            }
            break;
        case 'horizontalPadding':
            if (typeof node.paddingLeft !== 'undefined') {
                node.paddingLeft = 0;
                node.paddingRight = 0;
            }
            break;
        case 'verticalPadding':
            if (typeof node.paddingTop !== 'undefined') {
                node.paddingTop = 0;
                node.paddingBottom = 0;
            }
            break;
        case 'itemSpacing':
            if (typeof node.itemSpacing !== 'undefined') {
                node.itemSpacing = 0;
            }
            break;
        default:
            break;
    }
}

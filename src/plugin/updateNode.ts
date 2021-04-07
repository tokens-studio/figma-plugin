import {convertToFigmaColor} from './helpers';
import setColorValuesOnTarget from './setColorValuesOnTarget';
import setTextValuesOnTarget from './setTextValuesOnTarget';

export default async function setValuesOnNode(node, values, data) {
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

    // SIZING: BOTH
    if (values.sizing) {
        if (typeof node.resize !== 'undefined') {
            node.resize(Number(values.sizing), Number(values.sizing));
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
            if (matchingStyles.length) {
                // matchingStyles[0].paints = [{color, opacity, type: 'SOLID'}];
                node.fillStyleId = matchingStyles[0].id;
            } else {
                setColorValuesOnTarget(node, {value: values.fill}, 'fills');
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
                setTextValuesOnTarget(node, {value: values.typography});
            }
        }
    } else if (
        values.fontFamilies ||
        values.fontWeights ||
        values.lineHeights ||
        values.fontSizes ||
        values.letterSpacing ||
        values.paragraphSpacing
    ) {
        if (node.type === 'TEXT') {
            setTextValuesOnTarget(node, {
                value: {
                    fontFamily: values.fontFamilies,
                    fontWeight: values.fontWeights,
                    lineHeight: values.lineHeights,
                    fontSize: values.fontSizes,
                    letterSpacing: values.letterSpacing,
                    paragraphSpacing: values.paragraphSpacing,
                },
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
        if (typeof node.paddingLeft !== 'undefined') {
            node.paddingLeft = Number(values.spacing);
            node.paddingRight = Number(values.spacing);
            node.paddingTop = Number(values.spacing);
            node.paddingBottom = Number(values.spacing);
            node.itemSpacing = Number(values.spacing);
        }
    }
    if (values.horizontalPadding) {
        if (typeof node.paddingLeft !== 'undefined') {
            node.paddingLeft = Number(values.horizontalPadding);
            node.paddingRight = Number(values.horizontalPadding);
        }
    }
    if (values.verticalPadding) {
        if (typeof node.paddingTop !== 'undefined') {
            node.paddingTop = Number(values.verticalPadding);
            node.paddingBottom = Number(values.verticalPadding);
        }
    }
    if (values.itemSpacing) {
        if (typeof node.itemSpacing !== 'undefined') {
            node.itemSpacing = Number(values.itemSpacing);
        }
    }

    // Raw value for text layers
    if (values.tokenValue) {
        if (typeof node.characters !== 'undefined') {
            await figma.loadFontAsync(node.fontName);
            node.characters = String(values.tokenValue);
        }
    }

    // Name value for text layers
    if (values.tokenName) {
        if (typeof node.characters !== 'undefined') {
            await figma.loadFontAsync(node.fontName);
            node.characters = String(values.tokenName);
        }
    }

    // Name value for text layers
    if (values.description) {
        if (typeof node.characters !== 'undefined') {
            await figma.loadFontAsync(node.fontName);
            node.characters = String(values.description);
        }
    }
}

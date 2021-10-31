import {convertToFigmaColor} from './figmaTransforms/colors';
import {transformValue} from './helpers';
import setColorValuesOnTarget from './setColorValuesOnTarget';
import setTextValuesOnTarget from './setTextValuesOnTarget';

export default async function setValuesOnNode(node, values, data, ignoreFirstPartForStyles = false) {
    try {
        // BORDER RADIUS
        if (typeof values.borderRadius !== 'undefined' && typeof node.cornerRadius !== 'undefined') {
            node.cornerRadius = transformValue(values.borderRadius, 'borderRadius');
        }
        if (typeof values.borderRadiusTopLeft !== 'undefined' && typeof node.topLeftRadius !== 'undefined') {
            node.topLeftRadius = transformValue(values.borderRadiusTopLeft, 'borderRadius');
        }
        if (typeof values.borderRadiusTopRight !== 'undefined' && typeof node.topRightRadius !== 'undefined') {
            node.topRightRadius = transformValue(values.borderRadiusTopRight, 'borderRadius');
        }
        if (typeof values.borderRadiusBottomRight !== 'undefined' && typeof node.bottomRightRadius !== 'undefined') {
            node.bottomRightRadius = transformValue(values.borderRadiusBottomRight, 'borderRadius');
        }
        if (typeof values.borderRadiusBottomLeft !== 'undefined' && typeof node.bottomLeftRadius !== 'undefined') {
            node.bottomLeftRadius = transformValue(values.borderRadiusBottomLeft, 'borderRadius');
        }

        // BOX SHADOW
        if (typeof values.boxShadow !== 'undefined' && typeof node.effects !== 'undefined') {
            // get all effects, but remove DROP_SHADOW, since we're about to add it
            const effects = node.effects.filter((effect) => effect.type !== 'DROP_SHADOW');
            const {x, y, spread, color, blur} = values.boxShadow;
            const {
                color: {r, g, b},
                opacity,
            } = convertToFigmaColor(color);

            const effect: ShadowEffect = {
                type: 'DROP_SHADOW',
                visible: true,
                blendMode: 'NORMAL',
                color: {r, g, b, a: opacity},
                offset: {x: transformValue(x, 'boxShadow'), y: transformValue(y, 'boxShadow')},
                radius: transformValue(blur, 'boxShadow'),
                spread: transformValue(spread, 'boxShadow'),
            };

            effects.push(effect);
            node.effects = effects;
        }

        // BORDER WIDTH
        if (typeof values.borderWidth !== 'undefined' && typeof node.strokeWeight !== 'undefined') {
            node.strokeWeight = transformValue(values.borderWidth, 'borderWidth');
        }

        // OPACITY
        if (typeof values.opacity !== 'undefined' && typeof node.opacity !== 'undefined') {
            node.opacity = transformValue(values.opacity, 'opacity');
        }

        // SIZING: BOTH
        if (typeof values.sizing !== 'undefined' && typeof node.resize !== 'undefined') {
            node.resize(transformValue(values.sizing, 'sizing'), transformValue(values.sizing, 'sizing'));
        }

        // SIZING: WIDTH
        if (typeof values.width !== 'undefined' && typeof node.resize !== 'undefined') {
            node.resize(transformValue(values.width, 'sizing'), node.height);
        }

        // SIZING: HEIGHT
        if (typeof values.height !== 'undefined' && typeof node.resize !== 'undefined') {
            node.resize(node.width, transformValue(values.height, 'sizing'));
        }

        // FILL
        if (values.fill && typeof values.fill === 'string') {
            if (typeof node.fills !== 'undefined') {
                const paints = figma.getLocalPaintStyles();
                const path = data.fill.split('.');
                const pathname = path.slice(ignoreFirstPartForStyles ? 1 : 0, path.length).join('/');
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

        // BORDER COLOR
        if (typeof values.border !== 'undefined') {
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
        if (typeof values.spacing !== 'undefined' && typeof node.paddingLeft !== 'undefined') {
            node.paddingLeft = transformValue(values.spacing, 'spacing');
            node.paddingRight = transformValue(values.spacing, 'spacing');
            node.paddingTop = transformValue(values.spacing, 'spacing');
            node.paddingBottom = transformValue(values.spacing, 'spacing');
            node.itemSpacing = transformValue(values.spacing, 'spacing');
        }
        if (typeof values.horizontalPadding !== 'undefined' && typeof node.paddingLeft !== 'undefined') {
            node.paddingLeft = transformValue(values.horizontalPadding, 'spacing');
            node.paddingRight = transformValue(values.horizontalPadding, 'spacing');
        }
        if (typeof values.verticalPadding !== 'undefined' && typeof node.paddingTop !== 'undefined') {
            node.paddingTop = transformValue(values.verticalPadding, 'spacing');
            node.paddingBottom = transformValue(values.verticalPadding, 'spacing');
        }
        if (typeof values.itemSpacing !== 'undefined' && typeof node.itemSpacing !== 'undefined') {
            node.itemSpacing = transformValue(values.itemSpacing, 'spacing');
        }

        if (typeof values.paddingTop !== 'undefined' && typeof node.paddingTop !== 'undefined') {
            node.paddingTop = transformValue(values.paddingTop, 'spacing');
        }
        if (typeof values.paddingRight !== 'undefined' && typeof node.paddingRight !== 'undefined') {
            node.paddingRight = transformValue(values.paddingRight, 'spacing');
        }
        if (typeof values.paddingBottom !== 'undefined' && typeof node.paddingBottom !== 'undefined') {
            node.paddingBottom = transformValue(values.paddingBottom, 'spacing');
        }
        if (typeof values.paddingLeft !== 'undefined' && typeof node.paddingLeft !== 'undefined') {
            node.paddingLeft = transformValue(values.paddingLeft, 'spacing');
        }

        // Raw value for text layers
        if (values.tokenValue) {
            if (typeof node.characters !== 'undefined') {
                await figma.loadFontAsync(node.fontName);

                // If we're inserting an object, stringify that
                const value =
                    typeof values.tokenValue === 'object' ? JSON.stringify(values.tokenValue) : values.tokenValue;
                node.characters = String(value);
            }
        }

        // Real value for text layers
        if (values.value) {
            if (typeof node.characters !== 'undefined') {
                await figma.loadFontAsync(node.fontName);
                // If we're inserting an object, stringify that
                const value = typeof values.value === 'object' ? JSON.stringify(values.value) : values.value;
                node.characters = String(value);
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
    } catch (e) {
        console.log('Error setting data on node', e);
    }
}

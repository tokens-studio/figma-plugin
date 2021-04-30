/* eslint-disable no-param-reassign */
import {figmaRGBToHex} from '@figma-plugin/helpers';
import {NewTokenObject, SingleTokenObject} from 'types/tokens';
import {ColorToken} from '../../types/propertyTypes';
import {slugify} from '../app/components/utils';
import {convertFigmaGradientToString} from './figmaTransforms/gradients';
import {convertFigmaToLetterSpacing} from './figmaTransforms/letterSpacing';
import {convertFigmaToLineHeight} from './figmaTransforms/lineHeight';
import {notifyStyleValues} from './notifiers';

export default function pullStyles(styleTypes): void {
    let colors: NewTokenObject[] = [];
    let typography: NewTokenObject[] = [];
    let fontFamilies: NewTokenObject[] = [];
    let lineHeights: NewTokenObject[] = [];
    let fontWeights: NewTokenObject[] = [];
    let fontSizes: NewTokenObject[] = [];
    let letterSpacing: NewTokenObject[] = [];
    let paragraphSpacing: NewTokenObject[] = [];
    if (styleTypes.colorStyles) {
        colors = figma
            .getLocalPaintStyles()
            .filter((style) => style.paints.length === 1)
            .map((style) => {
                const paint = style.paints[0];
                let styleObject: ColorToken = {};
                if (style.description) {
                    styleObject.description = style.description;
                }
                if (paint.type === 'SOLID') {
                    const {r, g, b} = paint.color;
                    const a = paint.opacity;
                    styleObject.value = figmaRGBToHex({r, g, b, a});
                } else if (paint.type === 'GRADIENT_LINEAR') {
                    styleObject.value = convertFigmaGradientToString(paint);
                } else {
                    styleObject = null;
                }
                const normalizedName = style.name
                    .split('/')
                    .map((section) => section.trim())
                    .join('.');

                return styleObject
                    ? {
                          name: normalizedName,
                          type: 'color',
                          ...styleObject,
                      }
                    : null;
            })
            .filter(Boolean);
    }

    if (styleTypes.textStyles) {
        const rawFontSizes = [];
        const fontCombinations = [];
        const rawLineHeights = [];
        const rawParagraphSpacing = [];
        const rawLetterSpacing = [];

        const figmaTextStyles = figma.getLocalTextStyles();
        figmaTextStyles.map((style) => {
            if (!rawFontSizes.includes(style.fontSize)) rawFontSizes.push(style.fontSize);
            fontCombinations.push(style.fontName);
            rawLineHeights.push(style.lineHeight);
            if (!rawParagraphSpacing.includes(style.paragraphSpacing)) rawParagraphSpacing.push(style.paragraphSpacing);
            rawLetterSpacing.push(style.letterSpacing);
        });

        fontSizes = rawFontSizes
            .sort((a, b) => a - b)
            .map((size, idx) => ({
                name: `global.fontSize.${idx}`,
                value: size.toString(),
                type: 'fontSize',
            }));
        const uniqueFontCombinations = fontCombinations.filter(
            (v, i, a) => a.findIndex((t) => t.family === v.family && t.style === v.style) === i
        );
        lineHeights = rawLineHeights
            .filter((v, i, a) => a.findIndex((t) => t.unit === v.unit && t.value === v.value) === i)
            .map((lh, idx) => ({
                name: `global.lineHeights.${idx}`,
                value: convertFigmaToLineHeight(lh).toString(),
                type: 'lineHeight',
            }));

        fontFamilies = [...new Set(uniqueFontCombinations.map((font) => font.family))].map((fontFamily) => ({
            name: `global.fontFamilies.${slugify(fontFamily)}`,
            value: fontFamily,
            type: 'fontFamily',
        }));

        fontWeights = uniqueFontCombinations.map((font, idx) => ({
            name: `global.fontWeights.${slugify(font.family)}-${idx}`,
            value: font.style,
            type: 'fontWeight',
        }));

        paragraphSpacing = rawParagraphSpacing
            .sort((a, b) => a - b)
            .map((size, idx) => ({
                name: `global.paragraphSpacing.${idx}`,
                value: size.toString(),
                type: 'paragraphSpacing',
            }));

        letterSpacing = rawLetterSpacing
            .filter((v, i, a) => a.findIndex((t) => t.unit === v.unit && t.value === v.value) === i)
            .map((lh, idx) => ({
                name: `global.letterSpacing.${idx}`,
                value: convertFigmaToLetterSpacing(lh).toString(),
                type: 'letterSpacing',
            }));

        typography = figmaTextStyles.map((style) => {
            const obj = {
                fontFamily: fontFamilies.find((el: SingleTokenObject) => el.value === style.fontName.family)[0]?.name,
                fontWeight: fontWeights.find(
                    (el: SingleTokenObject) =>
                        el.name.includes(slugify(style.fontName.family)) && el.value === style.fontName?.style
                )[0]?.name,
                lineHeight: lineHeights.find(
                    (el: SingleTokenObject) => el.value === convertFigmaToLineHeight(style.lineHeight).toString()
                )[0]?.name,
                fontSize: fontSizes.find((el: SingleTokenObject) => el.value === style.fontSize.toString())[0]?.name,
                letterSpacing: letterSpacing.find(
                    (el: SingleTokenObject) => el.value === convertFigmaToLetterSpacing(style.letterSpacing).toString()
                )[0]?.name,
                paragraphSpacing: paragraphSpacing.find(
                    (el: SingleTokenObject) => el.value === style.paragraphSpacing.toString()
                )[0]?.name,
            };

            const normalizedName = style.name
                .split('/')
                .map((section) => section.trim())
                .join('.');

            const styleObject = {name: normalizedName, value: obj, type: 'typography'};

            if (style.description) {
                styleObject.description = style.description;
            }

            return styleObject;
        });
    }

    notifyStyleValues({
        colors,
        fontFamilies,
        lineHeights,
        fontWeights,
        fontSizes,
        letterSpacing,
        paragraphSpacing,
        // typography, -> Deactivated until we know how to treat these tokens
    });
}

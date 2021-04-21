/* eslint-disable no-param-reassign */
import {figmaRGBToHex} from '@figma-plugin/helpers';
import {ColorToken, TypographyToken} from '../../types/propertyTypes';
import {slugify} from '../app/components/utils';
import {convertFigmaGradientToString} from './figmaTransforms/gradients';
import {convertFigmaToLetterSpacing} from './figmaTransforms/letterSpacing';
import {convertFigmaToLineHeight} from './figmaTransforms/lineHeight';
import {notifyStyleValues} from './notifiers';

export default function pullStyles(styleTypes): void {
    let colors;
    let typography;
    let fontFamilies;
    let lineHeights;
    let fontWeights;
    let fontSizes;
    let letterSpacing;
    let paragraphSpacing;
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
                    .join('/');

                return styleObject ? [normalizedName, styleObject] : null;
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

        fontSizes = rawFontSizes.sort((a, b) => a - b).map((size, idx) => [idx, size]);
        const uniqueFontCombinations = fontCombinations.filter(
            (v, i, a) => a.findIndex((t) => t.family === v.family && t.style === v.style) === i
        );

        lineHeights = rawLineHeights
            .filter((v, i, a) => a.findIndex((t) => t.unit === v.unit && t.value === v.value) === i)
            .map((lh, idx) => [idx, convertFigmaToLineHeight(lh)]);

        fontFamilies = [...new Set(uniqueFontCombinations.map((font) => font.family))].map((fontFamily) => [
            `font-${slugify(fontFamily)}`,
            fontFamily,
        ]);

        fontWeights = uniqueFontCombinations.map((font, idx) => [`font-${slugify(font.family)}-${idx}`, font.style]);

        paragraphSpacing = rawParagraphSpacing.sort((a, b) => a - b).map((size, idx) => [idx, size]);

        letterSpacing = rawLetterSpacing
            .filter((v, i, a) => a.findIndex((t) => t.unit === v.unit && t.value === v.value) === i)
            .map((lh, idx) => [idx, convertFigmaToLetterSpacing(lh)]);

        typography = figmaTextStyles.map((style) => {
            const obj = {
                fontFamily: `$fontFamilies.${fontFamilies.find((el: string[]) => el[1] === style.fontName.family)[0]}`,
                fontWeight: `$fontWeights.${
                    fontWeights.find(
                        (el: string[]) =>
                            el[0].includes(slugify(style.fontName.family)) && el[1] === style.fontName.style
                    )[0]
                }`,
                lineHeight: `$lineHeights.${
                    lineHeights.find(
                        (el: [number, string | number]) => el[1] === convertFigmaToLineHeight(style.lineHeight)
                    )[0]
                }`,
                fontSize: `$fontSizes.${fontSizes.find((el: number[]) => el[1] === style.fontSize)[0]}`,
                letterSpacing: `$letterSpacing.${
                    letterSpacing.find(
                        (el: [number, string | number]) => el[1] === convertFigmaToLetterSpacing(style.letterSpacing)
                    )[0]
                }`,
                paragraphSpacing: `$paragraphSpacing.${
                    paragraphSpacing.find((el: number[]) => el[1] === style.paragraphSpacing)[0]
                }`,
            };
            const styleObject: TypographyToken = {value: obj};

            if (style.description) {
                styleObject.description = style.description;
            }

            const normalizedName = style.name
                .split('/')
                .map((section) => section.trim())
                .join('/');

            return [normalizedName, styleObject];
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
        typography,
    });
}

import {convertLetterSpacingToFigma, convertLineHeightToFigma} from './helpers';

export default async function setTextValuesOnTarget(target, token) {
    const {value, description} = token;
    const {fontFamily, fontWeight, fontSize, lineHeight, letterSpacing, paragraphSpacing} = value;
    const family = fontFamily || target.fontName.family;
    const style = fontWeight || target.fontName.style;
    await figma.loadFontAsync({family, style});

    if (fontFamily && fontWeight) {
        target.fontName = {
            family,
            style,
        };
    }

    if (fontSize) {
        target.fontSize = Number(fontSize);
    }
    if (lineHeight) {
        target.lineHeight = convertLineHeightToFigma(lineHeight);
    }
    if (letterSpacing) {
        target.letterSpacing = convertLetterSpacingToFigma(letterSpacing);
    }
    if (paragraphSpacing) {
        target.paragraphSpacing = Number(paragraphSpacing);
    }
    if (description) {
        target.description = description;
    }
}

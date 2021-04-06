import updateColorStyles from './updateColorStyles';
import updateTextStyles from './updateTextStyles';

export default function updateStyles(tokens, shouldCreate = false): void {
    console.log('Updating styles', tokens);
    const colorTokens = tokens.filter((n) => ['color', 'colors'].includes(n.type));
    const textTokens = tokens.filter((n) => ['typography'].includes(n.type));

    console.log('Styles are', colorTokens, textTokens);

    if (!colorTokens && !textTokens) return;
    if (colorTokens) {
        updateColorStyles(colorTokens, shouldCreate);
    }
    if (textTokens) {
        updateTextStyles(textTokens, shouldCreate);
    }
}

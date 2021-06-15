import {transformValue} from './helpers';
import updateColorStyles from './updateColorStyles';
import updateTextStyles from './updateTextStyles';

export default function updateStyles(tokens, shouldCreate = false): void {
    const styleTokens = tokens.map((token) => ({
        ...token,
        name: token.name.split('.').join('/'),
        value: transformValue(token.value, token.type),
    }));
    const colorTokens = styleTokens.filter((n) => ['color', 'colors'].includes(n.type));
    const textTokens = styleTokens.filter((n) => ['typography'].includes(n.type));

    if (!colorTokens && !textTokens) return;
    if (colorTokens.length > 0) {
        updateColorStyles(colorTokens, shouldCreate);
    }
    if (textTokens.length > 0) {
        updateTextStyles(textTokens, shouldCreate);
    }
}

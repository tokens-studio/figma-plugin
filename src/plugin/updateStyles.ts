import {convertToTokenArray} from '@/utils/convertTokens';
import updateColorStyles from './updateColorStyles';
import updateTextStyles from './updateTextStyles';

export default function updateStyles(tokens, shouldCreate = false): void {
    const tokenArray = convertToTokenArray(tokens, true);

    const colorTokens = tokenArray
        .filter((n) => ['color', 'colors'].includes(n[0].split('/')[0]))
        .map(([key, value]) => {
            const arr = key.split('/');
            arr.shift();
            return [arr.join('/'), value];
        });
    const textTokens = tokenArray
        .filter((n) => ['typography'].includes(n[0].split('/')[0]))
        .map(([key, value]) => {
            const arr = key.split('/');
            arr.shift();
            return [arr.join('/'), value];
        });
    if (!colorTokens && !textTokens) return;
    if (colorTokens) {
        updateColorStyles(colorTokens, shouldCreate);
    }
    if (textTokens) {
        updateTextStyles(textTokens, shouldCreate);
    }
}

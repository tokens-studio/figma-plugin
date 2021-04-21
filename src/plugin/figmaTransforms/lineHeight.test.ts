import {convertFigmaToLineHeight} from './lineHeight';

describe('convertFigmaToLineHeight', () => {
    it('converts a figma line height to a readable input value', () => {
        const lineHeightPx = convertFigmaToLineHeight({unit: 'PIXELS', value: 13});
        expect(lineHeightPx).toBe(13);
        const lineHeightPerc = convertFigmaToLineHeight({unit: 'PERCENT', value: 13});
        expect(lineHeightPerc).toBe('13%');
        const lineHeightAuto = convertFigmaToLineHeight({unit: 'AUTO'});
        expect(lineHeightAuto).toBe('AUTO');
    });
});

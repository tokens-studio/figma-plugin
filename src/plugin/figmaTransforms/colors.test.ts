import {convertToFigmaColor, hexToRgb, hslaToRgba} from './colors';

describe('hslaToRgba', () => {
    it('converts hsla to rgba', () => {
        const hsl = hslaToRgba([210, 50, 50]);
        expect(hsl).toEqual([64, 128, 191, 1]);
        const hsla = hslaToRgba([210, 50, 50, 0.5]);
        expect(hsla).toEqual([64, 128, 191, 0.5]);
    });
});
describe('hexToRgb', () => {
    it('converts hex to rgb', () => {
        const color = '#ff0000';

        expect(hexToRgb(color)).toEqual({r: 255, g: 0, b: 0});
    });

    it('returns null if no match', () => {
        const color = 'rgb(0000)';

        expect(hexToRgb(color)).toBe(null);
    });
});

describe('convertToFigmaColor', () => {
    it('convert any color to a figma readable color', () => {
        const rgb = 'rgb(255,255,255)';
        expect(convertToFigmaColor(rgb)).toEqual({
            color: {
                r: 1,
                g: 1,
                b: 1,
            },
            opacity: 1,
        });
        const rgba = 'rgba(51,51,51,0.5)';
        expect(convertToFigmaColor(rgba)).toEqual({
            color: {
                r: 0.2,
                g: 0.2,
                b: 0.2,
            },
            opacity: 0.5,
        });
        const hex = '#ff0000';
        expect(convertToFigmaColor(hex)).toEqual({
            color: {
                r: 1,
                g: 0,
                b: 0,
            },
            opacity: 1,
        });
        const hexa = '#ff0000cc';
        expect(convertToFigmaColor(hexa)).toEqual({
            color: {
                r: 1,
                g: 0,
                b: 0,
            },
            opacity: 0.8,
        });
    });
});

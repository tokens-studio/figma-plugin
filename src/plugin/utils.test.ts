import {convertToRgb, isTypographyToken, lightOrDark, slugify} from '../app/components/utils';

describe('isTypographyToken', () => {
    it('returns truthiness of a typography token', () => {
        const token = {
            fontFamily: 'foo',
        };
        const weight = {
            fontWeight: 'foo',
        };
        const height = {
            lineHeight: 'foo',
        };
        const fullToken = {
            fontFamily: 'foo',
            fontWeight: 'normal',
            fontSize: '32',
            lineHeight: 'AUTO',
        };
        expect(isTypographyToken(token)).toBe(true);
        expect(isTypographyToken(fullToken)).toBe(true);
        expect(isTypographyToken(weight)).toBe(true);
        expect(isTypographyToken(height)).toBe(true);
    });
    it('rejects non-typography tokens', () => {
        const wrongToken = {
            value: {
                fontFamily: 'foo',
            },
        };

        const stringToken = 'string';

        expect(isTypographyToken(wrongToken)).toBe(false);
        expect(isTypographyToken(stringToken)).toBe(false);
    });
});

describe('convertToRgb', () => {
    it('transforms a color string to rgb values', () => {
        const hex = 'rgb(#ff0000, 0.5)';

        expect(convertToRgb(hex)).toBe('rgb(255, 0, 0, 0.5)');
    });
});

describe('lightToDark', () => {
    it('knows when a color is bright', () => {
        const light = '#fff';
        const lightRgb = 'rgb(255,255,255)';
        const lightRgba = 'rgba(255,255,255,1)';
        expect(lightOrDark(light)).toBe('light');
        expect(lightOrDark(lightRgb)).toBe('light');
        expect(lightOrDark(lightRgba)).toBe('light');
    });
    it('knows when a color is dark', () => {
        const black = '#000';
        const darkEnough = '#F3F3F3';
        const darkRgb = 'rgb(0,0,0)';
        const darkRgba = 'rgba(0,0,0,1)';
        expect(lightOrDark(black)).toBe('dark');
        expect(lightOrDark(darkEnough)).toBe('dark');
        expect(lightOrDark(darkRgb)).toBe('dark');
        expect(lightOrDark(darkRgba)).toBe('dark');
    });
});
describe('slugfy', () => {
    it('converts a string to a slug', () => {
        const string = 'Neue Montreal';
        expect(slugify(string)).toBe('neue-montreal');
    });
});

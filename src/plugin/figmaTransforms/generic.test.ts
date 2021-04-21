import {convertTypographyNumberToFigma} from './generic';

describe('convertTypographyNumberToFigma', () => {
    it('converts an input number-like string and returns a transformed value', () => {
        const pxValue = convertTypographyNumberToFigma('13px');
        expect(pxValue).toBe(13);
        const remValue = convertTypographyNumberToFigma('2rem');
        expect(remValue).toBe(32);
        const emValue = convertTypographyNumberToFigma('1.5em');
        expect(emValue).toBe(24);
        const numberStringValue = convertTypographyNumberToFigma('144');
        expect(numberStringValue).toBe(144);
        const numberValue = convertTypographyNumberToFigma(72);
        expect(numberValue).toBe(72);
    });
});

import {convertTypographyNumberToFigma, fakeZeroForFigma} from './generic';

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

describe('fakeZeroForFigma', () => {
    it('should return 0.01 for certain 0 values', () => {
        const zeroNumber = fakeZeroForFigma(0);
        expect(zeroNumber).toBe(0.001);
        const zeroString = fakeZeroForFigma('0');
        expect(zeroString).toBe(0.001);

        const otherNumber = fakeZeroForFigma(1);
        expect(otherNumber).toBe(1);
        const otherString = fakeZeroForFigma('Test');
        expect(otherString).toBe('Test');
    });
});

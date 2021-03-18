import {
    isObject,
    mergeDeep,
    convertFigmaToLineHeight,
    hslaToRgba,
    convertToFigmaColor,
    hexToRgb,
    convertStringToFigmaGradient,
    convertFigmaGradientToString,
} from './helpers';

describe('isObject', () => {
    it('correctly asserts an object', () => {
        const object = isObject({foo: 'bar'});
        expect(object).toBe(true);
    });
    it('correctly asserts a string', () => {
        const object = isObject('foo');
        expect(object).toBe(false);
    });
});

describe('mergeDeep', () => {
    it('merges two objects', () => {
        const object = mergeDeep({foo: 'bar'}, {foo: 'baz'});
        expect(object).toEqual({foo: 'baz'});
    });

    it('merges two objects with multiple keys', () => {
        const object = mergeDeep({300: {value: '#ff0000'}}, {300: {data: true}, 500: {value: '#ff0000'}});
        expect(object).toEqual({300: {value: '#ff0000', data: true}, 500: {value: '#ff0000'}});
    });
});

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

describe('convertStringtoFigmaGradient', () => {
    const test1 = {
        input: 'linear-gradient(45deg, #ffffff 0%, #000000 100%)',
        output: {
            gradientStops: [
                {
                    color: {
                        a: 1,
                        b: 1,
                        g: 1,
                        r: 1,
                    },
                    position: 0,
                },
                {
                    color: {
                        a: 1,
                        b: 0,
                        g: 0,
                        r: 0,
                    },
                    position: 1,
                },
            ],
            gradientTransform: [
                [0.71, 0.71, 0],
                [-0.71, 0.71, 0],
            ],
        },
    };

    const test2 = {
        input: 'linear-gradient(45deg, #ffffff 0%, rgba(255,0,0,0.5) 50%, #000000 100%)',
        output: {
            gradientStops: [
                {
                    color: {
                        a: 1,
                        b: 1,
                        g: 1,
                        r: 1,
                    },
                    position: 0,
                },
                {
                    color: {
                        a: 0.5,
                        b: 0,
                        g: 0,
                        r: 1,
                    },
                    position: 0.5,
                },
                {
                    color: {
                        a: 1,
                        b: 0,
                        g: 0,
                        r: 0,
                    },
                    position: 1,
                },
            ],
            gradientTransform: [
                [0.71, 0.71, 0],
                [-0.71, 0.71, 0],
            ],
        },
    };

    const test3 = {
        input: 'linear-gradient(45deg, #ffffff 0%, rgba(255,0,0,0.5) 50%, #000000 100%)',
        output: {
            gradientStops: [
                {
                    color: {
                        a: 1,
                        b: 1,
                        g: 1,
                        r: 1,
                    },
                    position: 0,
                },
                {
                    color: {
                        a: 0.5,
                        b: 0,
                        g: 0,
                        r: 1,
                    },
                    position: 0.5,
                },
                {
                    color: {
                        a: 1,
                        b: 0,
                        g: 0,
                        r: 0,
                    },
                    position: 1,
                },
            ],
            gradientTransform: [
                [0.71, 0.71, 0],
                [-0.71, 0.71, 0],
            ],
        },
    };

    expect(convertStringToFigmaGradient(test1.input)).toEqual(test1.output);
    expect(convertStringToFigmaGradient(test2.input)).toEqual(test2.output);
    expect(convertStringToFigmaGradient(test3.input)).toEqual(test3.output);
});

describe('convertFigmaGradientToString', () => {
    const test1: {
        input: GradientPaint;
        output: string;
    } = {
        input: {
            type: 'GRADIENT_LINEAR',
            gradientStops: [
                {
                    color: {
                        a: 1,
                        b: 1,
                        g: 1,
                        r: 1,
                    },
                    position: 0,
                },
                {
                    color: {
                        a: 1,
                        b: 0,
                        g: 0,
                        r: 0,
                    },
                    position: 1,
                },
            ],
            gradientTransform: [
                [0.71, 0.71, 0],
                [0.71, 0.71, 0],
            ],
        },
        output: 'linear-gradient(45deg, #ffffff 0%, #000000 100%)',
    };

    expect(convertFigmaGradientToString(test1.input)).toEqual(test1.output);
});

import {isObject, mergeDeep, transformValue} from './helpers';

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

describe('transformValue', () => {
    const tokens = [
        {
            input: '12px',
            type: 'spacing',
            output: 12,
        },
        {
            input: '12px',
            type: 'lineHeights',
            output: {
                unit: 'PIXELS',
                value: 12,
            },
        },
        {
            input: '160%',
            type: 'lineHeights',
            output: {
                unit: 'PERCENT',
                value: 160,
            },
        },
        {
            input: '24px',
            type: 'letterSpacing',
            output: {
                unit: 'PIXELS',
                value: 24,
            },
        },
        {
            input: '120%',
            type: 'letterSpacing',
            output: {
                unit: 'PERCENT',
                value: 120,
            },
        },
        {
            input: '120%',
            type: 'lineHeights',
            output: {
                unit: 'PERCENT',
                value: 120,
            },
        },
        {
            input: '2rem',
            type: 'sizing',
            output: 32,
        },
        {
            input: '0.24',
            type: 'sizing',
            output: 0.24,
        },
        {
            input: '50%',
            type: 'opacity',
            output: 0.5,
        },
        {
            input: '0.6',
            type: 'opacity',
            output: 0.6,
        },
    ];
    it('transforms non-conform values into their required formats', () => {
        tokens.forEach((token) => {
            expect(transformValue(token.input, token.type)).toEqual(token.output);
        });
    });
});

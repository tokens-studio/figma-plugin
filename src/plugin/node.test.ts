import {mapType, mapValuesToTokens, returnValueToLookFor} from './node';

describe('mapValuesToTokens', () => {
    it('maps values to tokens', () => {
        const tokens = {
            colors: {
                blue: '#0000ff',
            },
        };
        const values = {fill: 'colors.blue'};
        expect(mapValuesToTokens(tokens, values)).toEqual({
            fill: '#0000ff',
        });
    });
});

describe('mapType', () => {
    const typeTokens = {
        'colors.red.500': {
            value: '#0000ff',
            type: 'color',
        },
    };
    const noTypeToken = {
        'lineHeights.small': {
            value: '12px',
        },
    };

    it('returns type if one is available', () => {
        Object.entries(typeTokens).forEach((token) => {
            expect(mapType(token[0], token[1])).toEqual('color');
        });
        Object.entries(noTypeToken).forEach((token) => {
            expect(mapType(token[0], token[1])).toEqual('lineHeights');
        });
    });
});

describe('returnValueToLookFor', () => {
    it('returns value that were looking for', () => {
        const tokens = [
            {
                key: 'tokenName',
                input: {
                    description: 'my description',
                    value: '#ff0000',
                    name: 'colors.red.500',
                },
                output: 'colors.red.500',
            },
            {
                key: 'description',
                input: {
                    description: 'my description',
                    value: '#ff0000',
                    name: 'colors.red.500',
                },
                output: 'my description',
            },
            {
                key: 'tokenValue',
                input: {
                    description: 'my description',
                    value: '#ff0000',
                    name: 'colors.red.500',
                },
                output: '#ff0000',
            },
            {
                key: 'tokenValue',
                input: '#ff0000',
                output: '#ff0000',
            },
            {
                key: 'size',
                input: {
                    description: 'my description',
                    value: '12',
                    name: 'sizing.small',
                },
                output: '12',
            },
        ];
        tokens.forEach((token) => {
            expect(returnValueToLookFor(token.input, token.key, token.input.name)).toEqual(token.output);
        });
    });
});

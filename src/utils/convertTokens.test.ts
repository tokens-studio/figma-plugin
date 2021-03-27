import {convertToTokenArray} from './convertTokens';

describe('convertToTokenArray', () => {
    it('converts given tokens to an array', () => {
        const typographyTokens = {
            basic: {
                input: {
                    fontfamily: 'Inter',
                    fontWeight: 'Bold',
                    fontSize: 36,
                    description: 'Use for bold headings',
                },
                output: {
                    value: {
                        fontfamily: 'Inter',
                        fontWeight: 'Bold',
                        fontSize: 36,
                    },
                    description: 'Use for bold headings',
                },
            },
            withValue: {
                input: {
                    value: {
                        fontfamily: 'Inter',
                        fontWeight: 'Regular',
                        fontSize: 24,
                    },
                    description: 'Use for headings',
                },
                output: {
                    value: {
                        fontfamily: 'Inter',
                        fontWeight: 'Regular',
                        fontSize: 24,
                    },
                    description: 'Use for headings',
                },
            },
        };
        const basicTokens = {
            global: {
                withValue: {
                    value: 'bar',
                },
                basic: '#ff0000',
                typography: {
                    heading: {
                        h1: typographyTokens.basic.input,
                        h2: typographyTokens.withValue.input,
                    },
                },
            },
        };

        expect(convertToTokenArray(basicTokens)).toEqual([
            ['global/withValue', {value: 'bar'}],
            ['global/basic', {value: '#ff0000'}],
            ['global/typography/heading/h1', typographyTokens.basic.output],
            ['global/typography/heading/h2', typographyTokens.withValue.output],
        ]);
    });
});

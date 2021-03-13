import {convertToTokenArray} from './convertTokens';

describe('convertToTokenArray', () => {
    it('converts given tokens to an array', () => {
        const basicTokens = {
            global: {
                foo: {
                    value: 'bar',
                },
                bar: '#ff0000',
                typography: {
                    heading: {
                        h1: {
                            fontfamily: 'Inter',
                            fontWeight: 'regular',
                        },
                    },
                },
            },
        };

        expect(convertToTokenArray(basicTokens)).toEqual([
            ['global/foo', {value: 'bar'}],
            ['global/bar', {value: '#ff0000'}],
            [
                'global/typography/heading/h1',
                {
                    fontfamily: 'Inter',
                    fontWeight: 'regular',
                },
            ],
        ]);
    });
});

import convertTokensToObject from './convertTokensToObject';

describe('convertTokensToObject', () => {
    it('converts array-like tokens to nested object', () => {
        const tokens = {
            options: [
                {
                    name: 'colors.red',
                    type: 'color',
                    value: '#ff0000',
                },
                {
                    name: 'colors.blue',
                    value: '#0000ff',
                },
            ],
            theme: [
                {
                    name: 'colors.primary',
                    value: '$colors.red',
                },
            ],
        };

        expect(convertTokensToObject(tokens)).toEqual({
            options: {
                colors: {
                    red: {
                        value: '#ff0000',
                        type: 'color',
                    },
                    blue: {
                        value: '#0000ff',
                        type: 'color',
                    },
                },
            },
            theme: {
                colors: {
                    primary: {
                        value: '$colors.red',
                        type: 'color',
                    },
                },
            },
        });
    });
});

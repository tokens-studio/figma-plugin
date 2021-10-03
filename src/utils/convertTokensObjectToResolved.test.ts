import convertTokensObjectToResolved from './convertTokensObjectToResolved';

describe('convertTokensObjectToResolved', () => {
    it('converts object-like unresolved tokens to resolved object', () => {
        const tokens = {
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
                sizing: {
                    base: {
                        value: '2',
                        type: 'sizing',
                    },
                    scale: {
                        value: '1.5',
                        type: 'sizing',
                    },
                    small: {
                        value: '1 * {sizing.base}',
                        type: 'sizing',
                    },
                    medium: {
                        value: '{sizing.small} * {sizing.scale}',
                        type: 'sizing',
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
        };

        expect(convertTokensObjectToResolved(tokens)).toEqual({
            colors: {
                red: {
                    value: '#ff0000',
                    type: 'color',
                },
                blue: {
                    value: '#0000ff',
                    type: 'color',
                },
                primary: {
                    value: '#ff0000',
                    type: 'color',
                },
            },
            sizing: {
                base: {
                    value: 2,
                    type: 'sizing',
                },
                scale: {
                    value: 1.5,
                    type: 'sizing',
                },
                small: {
                    value: 2,
                    type: 'sizing',
                },
                medium: {
                    value: 3,
                    type: 'sizing',
                },
            },
        });
    });

    it('respects used sets', () => {
        const tokens = {
            global: {
                colors: {
                    white: {
                        value: '#ffffff',
                        type: 'color',
                    },
                    black: {
                        value: '#000000',
                        type: 'color',
                    },
                },
            },
            light: {
                colors: {
                    background: {
                        value: '$colors.white',
                        type: 'color',
                    },
                },
            },
            dark: {
                colors: {
                    background: {
                        value: '$colors.black',
                        type: 'color',
                    },
                },
            },
        };

        expect(convertTokensObjectToResolved(tokens, ['global', 'light'])).toEqual({
            colors: {
                white: {
                    value: '#ffffff',
                    type: 'color',
                },
                black: {
                    value: '#000000',
                    type: 'color',
                },
                background: {
                    value: '#ffffff',
                    type: 'color',
                },
            },
        });
    });
});

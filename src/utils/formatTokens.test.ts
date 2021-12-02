import formatTokens from './formatTokens';

describe('formatTokens', () => {
    it('converts given tokens to an array', () => {
        const typographyTokens = {
            global: [
                {name: 'withValue', value: 'bar'},
                {name: 'basic', value: '#ff0000'},
                {
                    name: 'typography.heading.h1',
                    value: {
                        fontFamily: 'Inter',
                        fontWeight: 'Bold',
                        fontSize: 36,
                    },
                    description: 'Use for bold headings',
                    type: 'typography',
                },
                {
                    name: 'typography.heading.h2',
                    value: {
                        fontFamily: 'Inter',
                        fontWeight: 'Regular',
                        fontSize: 24,
                    },
                    description: 'Use for headings',
                    type: 'typography',
                },
            ],
        };

        expect(formatTokens(typographyTokens, 'global')).toEqual(
            JSON.stringify(
                {
                    global: {
                        withValue: {
                            value: 'bar',
                        },
                        basic: {
                            value: '#ff0000',
                        },
                        typography: {
                            heading: {
                                h1: {
                                    fontFamily: {
                                        value: 'Inter',
                                    },
                                    fontWeight: {
                                        value: 'Bold',
                                    },
                                    fontSize: {
                                        value: 36,
                                    },
                                },
                                h2: {
                                    fontFamily: {
                                        value: 'Inter',
                                    },
                                    fontWeight: {
                                        value: 'Regular',
                                    },
                                    fontSize: {
                                        value: 24,
                                    },
                                },
                            },
                        },
                    },
                },
                null,
                2
            )
        );
    });
});

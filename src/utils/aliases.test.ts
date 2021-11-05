import getAliasValue from './aliases';

describe('getAliasValue', () => {
    const allTokens = [
        {
            name: 'colors.hex',
            input: '#ff0000',
            value: '#ff0000',
        },
        {
            name: 'colors.rgba',
            input: 'rgba(0, 255, 0, 0.5)',
            value: '#00ff0080',
        },
        {
            name: 'colors.rgbaalias',
            input: 'rgba($colors.hex, 0.5)',
            value: 'rgba(#ff0000, 0.5)',
        },
        {
            name: 'colors.lightness_base',
            input: '25',
            value: 25,
        },
        {
            name: 'colors.lightness',
            input: '$colors.lightness_base * 4 + 0.175',
            value: 100.175,
        },
        {
            name: 'colors.hsla_1',
            input: 'hsl(172,50,$colors.lightness_base)',
            value: 'hsl(172,50,25)',
        },
        {
            name: 'colors.hsla_2',
            input: 'hsl(172,50,$colors.lightness)',
            value: 'hsl(172,50,100.175)',
        },
        {
            name: 'alias.complex',
            input: '$base.scale * $base.ratio ^ round((200 + 400 - $base.index) / 100)',
            value: 8,
        },
        {
            name: 'alias.round2',
            input: '$alias.complex + $alias.complex * ((1100 - 400) / 100)',
            value: 64,
        },
        {
            name: 'alias.round3',
            input: '$alias.round2 * 1.5',
            value: 96,
        },
        {
            name: 'colors.zero',
            input: 0,
            value: 0,
        },
        {
            name: 'base.scale',
            input: '2',
            value: 2,
        },
        {
            name: 'base.ratio',
            input: '2',
            value: 2,
        },
        {
            name: 'base.index',
            input: '400',
            value: 400,
        },
    ];

    allTokens.forEach((token) => {
        it(`alias ${token.name}`, () => {
            expect(getAliasValue({value: token.input}, allTokens)).toEqual(token.value);
        });
    });
});

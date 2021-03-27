import checkIfAlias from './checkIfAlias';

describe('checkIfAlias', () => {
    const correctToken = {
        objectString: {
            value: '$colors.foo',
        },
        string: '$colors.foo',
        zero: '$colors.zero',
    };
    const incorrectToken = {
        nonexistant: '$colors.nonexistant',
        string: 'foo',
        number: 3,
        zero: 0,
        array: [0, 1, 2, 3],
    };
    const allTokens = {
        colors: {
            foo: 'red',
            zero: 0,
        },
    };

    describe('correct tokens', () => {
        Object.entries(correctToken).map((token) => {
            it(`token ${token[0]}`, () => {
                expect(checkIfAlias(token[1], allTokens)).toBe(true);
            });
        });
    });

    describe('incorrect tokens', () => {
        Object.entries(incorrectToken).map((token) => {
            it(`token ${token[0]}`, () => {
                expect(checkIfAlias(token[1], allTokens)).toBe(false);
            });
        });
    });
});

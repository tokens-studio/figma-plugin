import checkIfAlias from './checkIfAlias';

describe('checkIfAlias', () => {
    const correctToken = {
        objectString: {
            value: '$colors.foo',
        },
        string: '$colors.foo',
    };
    const incorrectToken = {
        nonexistant: '$colors.nonexistant',
        string: 'foo',
        number: 3,
        zero: 0,
        array: [0, 1, 2, 3],
    };
    const allTokens = {
        global: {
            colors: {
                foo: 'red',
            },
        },
    };

    it('correctly asserts if it is a value token', () => {
        Object.entries(correctToken).map((token) => {
            expect(checkIfAlias(token[1], allTokens)).toBe(true);
        });
    });

    it.only('correctly asserts if it is not a value token', () => {
        Object.entries(incorrectToken).map((token) => {
            expect(checkIfAlias(token[1], allTokens)).toBe(false);
        });
    });
});

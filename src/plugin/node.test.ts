import {mapValuesToTokens} from './node';

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

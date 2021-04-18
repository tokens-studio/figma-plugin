import {mapValuesToTokens} from './node';

describe('mapValuesToTokens', () => {
    it('maps values to tokens', () => {
        const tokens = [{name: 'global.colors.blue', value: '#0000ff'}];

        const values = {fill: 'global.colors.blue'};
        expect(mapValuesToTokens(tokens, values)).toEqual({
            fill: '#0000ff',
        });
    });
});

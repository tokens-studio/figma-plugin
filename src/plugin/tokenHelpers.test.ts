import {resolveTokenValues} from './tokenHelpers';

const tokens = [
    {name: 'foo', value: 3},
    {name: 'bar', value: '{foo}'},
    {name: 'boo', value: '{baz}'},
    {name: 'math', value: '{foo} * 2'},
    {name: 'mathWrong', value: '{foo} * {boo}'},
    {name: 'colors.red.500', value: '#ff0000'},
    {name: 'opacity.default', value: '0.2 + 0.2'},
    {name: 'opacity.full', value: '{opacity.default} + 0.6'},
    {name: 'theme.accent.default', value: 'rgba({colors.red.500}, 0.5)'},
    {name: 'theme.accent.subtle', value: 'rgba({colors.red.500}, {opacity.default})'},
    {name: 'theme.accent.deep', value: 'rgba({theme.accent.default}, {opacity.full})'},
];

const output = [
    {
        name: 'foo',
        rawValue: 3,
        value: 3,
    },
    {
        name: 'bar',
        rawValue: '{foo}',
        value: 3,
    },
    {
        failedToResolve: true,
        name: 'boo',
        rawValue: '{baz}',
        value: '{baz}',
    },
    {
        name: 'math',
        rawValue: '{foo} * 2',
        value: 6,
    },
    {
        failedToResolve: true,
        name: 'mathWrong',
        rawValue: '{foo} * {boo}',
        value: '3 * {baz}',
    },
    {
        name: 'colors.red.500',
        rawValue: '#ff0000',
        value: '#ff0000',
    },
    {
        name: 'opacity.default',
        rawValue: '0.2 + 0.2',
        value: 0.4,
    },
    {
        name: 'opacity.full',
        rawValue: '{opacity.default} + 0.6',
        value: 1,
    },
    {
        name: 'theme.accent.default',
        rawValue: 'rgba({colors.red.500}, 0.5)',
        value: '#ff000080',
    },
    {
        name: 'theme.accent.subtle',
        rawValue: 'rgba({colors.red.500}, {opacity.default})',
        value: '#ff000066',
    },
    {
        name: 'theme.accent.deep',
        rawValue: 'rgba({theme.accent.default}, {opacity.full})',
        value: '#ff0000',
    },
];
describe('resolveTokenValues', () => {
    it('resolves all values it can resolve', () => {
        expect(resolveTokenValues(tokens)).toEqual(output);
    });
});

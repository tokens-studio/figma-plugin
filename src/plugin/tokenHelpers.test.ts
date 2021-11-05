import {resolveTokenValues} from './tokenHelpers';

const tokens = [
    {name: 'foo', value: 3},
    {name: 'bar', value: '{foo}'},
    {name: 'boo', value: '{baz}'},
    {name: 'math', value: '{foo} * 2'},
    {name: 'mathWrong', value: '{foo} * {boo}'},
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
];
describe('resolveTokenValues', () => {
    it('resolves all values it can resolve', () => {
        expect(resolveTokenValues(tokens)).toEqual(output);
    });
});

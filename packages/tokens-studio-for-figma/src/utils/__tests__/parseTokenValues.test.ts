import parseTokenValues from '../parseTokenValues';
import input from '../test/github/input.json';
import output from '../test/github/output.json';

describe('parseTokenValues', () => {
  it('converts object-like tokens to an array but keeps order', () => {
    expect(parseTokenValues(input)).toEqual(output);
  });
});

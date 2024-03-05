import parseJson from './parseJson';

describe('parseJson', () => {
  const regularInput = "{ 'global': { 'colors': { 'blue': { 'value': '#0000ff' }}}}";
  const JSON5Input = "{ global: { colors: { blue: { value: '#0000ff', /* a comment */ }}}}";

  it('returns parsed json', () => {
    expect(parseJson(regularInput)).toEqual({ global: { colors: { blue: { value: '#0000ff' } } } });
    expect(parseJson(JSON5Input)).toEqual({ global: { colors: { blue: { value: '#0000ff' } } } });
  });
});

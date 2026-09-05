import { convertDurationToMs } from './duration';

describe('convertDurationToMs', () => {
  it('parses ms strings', () => {
    expect(convertDurationToMs('200ms')).toBe(200);
    expect(convertDurationToMs('0ms')).toBe(0);
  });

  it('parses s strings and converts to ms', () => {
    expect(convertDurationToMs('0.2s')).toBe(200);
    expect(convertDurationToMs('2s')).toBe(2000);
  });

  it('treats bare numbers as already ms', () => {
    expect(convertDurationToMs(200)).toBe(200);
  });

  it('parses the DTCG object form', () => {
    expect(convertDurationToMs({ value: 200, unit: 'ms' })).toBe(200);
    expect(convertDurationToMs({ value: 0.2, unit: 's' })).toBe(200);
  });

  it('accepts bare numeric strings', () => {
    expect(convertDurationToMs('200')).toBe(200);
  });

  it('returns NaN for garbage', () => {
    expect(Number.isNaN(convertDurationToMs('nope'))).toBe(true);
    expect(Number.isNaN(convertDurationToMs(null))).toBe(true);
    expect(Number.isNaN(convertDurationToMs(undefined))).toBe(true);
  });
});

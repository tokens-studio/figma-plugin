import { convertFigmaToLineHeight, convertLineHeightToFigma } from './lineHeight';

describe('convertFigmaToLineHeight', () => {
  it('converts a figma line height to a readable input value', () => {
    const lineHeightPx = convertFigmaToLineHeight({ unit: 'PIXELS', value: 13 });
    expect(lineHeightPx).toBe(13);
    const lineHeightPerc = convertFigmaToLineHeight({ unit: 'PERCENT', value: 13 });
    expect(lineHeightPerc).toBe('13%');
    const lineHeightAuto = convertFigmaToLineHeight({ unit: 'AUTO' });
    expect(lineHeightAuto).toBe('AUTO');
  });
});

describe('convertLineHeightToFigma', () => {
  it('converts a line height to a figma readable value', () => {
    const lineHeightPx = convertLineHeightToFigma('13px');
    expect(lineHeightPx).toStrictEqual({ unit: 'PIXELS', value: 13 });
    const lineHeightPerc = convertLineHeightToFigma('160%');
    expect(lineHeightPerc).toStrictEqual({ unit: 'PERCENT', value: 160 });
    const lineHeightRem = convertLineHeightToFigma('2rem');
    expect(lineHeightRem).toStrictEqual({ unit: 'PIXELS', value: 32 });
    const lineHeightUnitLess = convertLineHeightToFigma('15');
    expect(lineHeightUnitLess).toStrictEqual({ unit: 'PIXELS', value: 15 });
    const lineHeightAuto = convertLineHeightToFigma('AUTO');
    expect(lineHeightAuto).toStrictEqual({ unit: 'AUTO' });
  });
});

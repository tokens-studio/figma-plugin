import { convertFigmaToTextDecoration, convertTextDecorationToFigma } from './textDecoration';

describe('convertTextDecorationToFigma', () => {
  it('converts text decoration to figma compliant string', () => {
    expect(convertTextDecorationToFigma('none')).toBe('NONE');
    expect(convertTextDecorationToFigma('underline')).toBe('UNDERLINE');
    expect(convertTextDecorationToFigma('line-through')).toBe('STRIKETHROUGH');
    expect(convertTextDecorationToFigma('strikethrough')).toBe('STRIKETHROUGH');
  });
  it('converts non-compliant textDecoration to NONE', () => {
    expect(convertTextDecorationToFigma('something')).toBe('NONE');
  });
});

describe('convertFigmaToTextDecoration', () => {
  it('converts text decoration to figma compliant string', () => {
    expect(convertFigmaToTextDecoration('NONE')).toBe('none');
    expect(convertFigmaToTextDecoration('UNDERLINE')).toBe('underline');
    expect(convertFigmaToTextDecoration('STRIKETHROUGH')).toBe('line-through');
  });
});

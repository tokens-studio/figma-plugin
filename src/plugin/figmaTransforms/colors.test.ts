import { convertToRgb } from '@/utils/color';
import { convertToFigmaColor, hslaToRgba, RGBAToHexA } from './colors';

describe('hslaToRgba', () => {
  it('converts hsla to rgba', () => {
    const hsl = hslaToRgba([210, 50, 50]);
    expect(hsl).toEqual([64, 128, 191, 1]);
    const hsla = hslaToRgba([210, 50, 50, 0.5]);
    expect(hsla).toEqual([64, 128, 191, 0.5]);
    expect(hslaToRgba([75, 50, 50])).toEqual([159, 191, 64, 1]);
    expect(hslaToRgba([157, 50, 50])).toEqual([64, 191, 142, 1]);
    expect(hslaToRgba([248, 50, 50])).toEqual([81, 64, 191, 1]);
    expect(hslaToRgba([311, 50, 50])).toEqual([191, 64, 168, 1]);
  });
});

describe('convertToFigmaColor', () => {
  it('convert any color to a figma readable color', () => {
    const rgb = 'rgb(255,255,255)';
    expect(convertToFigmaColor(rgb)).toEqual({
      color: {
        r: 1,
        g: 1,
        b: 1,
      },
      opacity: 1,
    });
    const rgba = 'rgba(51,51,51,0.5)';
    expect(convertToFigmaColor(rgba)).toEqual({
      color: {
        r: 0.2,
        g: 0.2,
        b: 0.2,
      },
      opacity: 0.5,
    });
    const hex = '#ff0000';
    expect(convertToFigmaColor(hex)).toEqual({
      color: {
        r: 1,
        g: 0,
        b: 0,
      },
      opacity: 1,
    });
    const hexa = '#ff0000cc';
    expect(convertToFigmaColor(hexa)).toEqual({
      color: {
        r: 1,
        g: 0,
        b: 0,
      },
      opacity: 0.8,
    });
    const hsl = 'hsl(0, 100%, 50%)';
    expect(convertToFigmaColor(hsl)).toEqual({
      color: {
        r: 1,
        g: 0,
        b: 0,
      },
      opacity: 1,
    });
  });

  it('converts named colors to figma readable', () => {
    const color = 'red';

    expect(convertToFigmaColor(color)).toEqual({
      color: {
        r: 1,
        g: 0,
        b: 0,
      },
      opacity: 1,
    });
  });
});

describe('round-trip from plugin to figma', () => {
  it('converts rgba to figma', () => {
    const color = 'rgba(255, 255, 0, 0.5)';
    const converted = convertToRgb(color);

    expect(converted).toEqual('#ffff0080');
    expect(convertToFigmaColor(converted!)).toEqual({
      color: {
        r: 1,
        g: 1,
        b: 0,
      },
      opacity: 0.5,
    });
  });
});

describe('rgbaToHexA', () => {
  it('converts rgba to hex', () => {
    const color = {
      red: 67,
      green: 235,
      blue: 111,
      alpha: 0.85,
    };
    expect(RGBAToHexA(color.red, color.green, color.blue, color.alpha)).toBe('#43eb6fd9');
  });
});

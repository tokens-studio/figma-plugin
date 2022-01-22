import { convertToRgb } from '@/app/components/utils';
import { convertToFigmaColor, hslaToRgba } from './colors';

describe('hslaToRgba', () => {
  it('converts hsla to rgba', () => {
    const hsl = hslaToRgba([210, 50, 50]);
    expect(hsl).toEqual([64, 128, 191, 1]);
    const hsla = hslaToRgba([210, 50, 50, 0.5]);
    expect(hsla).toEqual([64, 128, 191, 0.5]);
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
    expect(convertToFigmaColor(converted)).toEqual({
      color: {
        r: 1,
        g: 1,
        b: 0,
      },
      opacity: 0.5,
    });
  });
});

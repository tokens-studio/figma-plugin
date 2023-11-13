import { figmaRGBToHex, hexToFigmaRGB, webRGBToFigmaRGB } from '@figma-plugin/helpers';
import { toHex } from 'color2k';

type WebRGBA = [number, number, number, number];
interface RGBA {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export function RGBAToHexA(red: number | string, green: number | string, blue: number | string, alpha: number | string) {
  const r = parseInt(String(red), 10);
  const g = parseInt(String(green), 10);
  const b = parseInt(String(blue), 10);
  const a = parseFloat(parseFloat(String(alpha)).toFixed(2));

  const outParts = [
    r.toString(16),
    g.toString(16),
    b.toString(16),
    Math.round(a * 255)
      .toString(16)
      .substring(0, 2),
  ];

  // Pad single-digit output values
  outParts.forEach((part, i) => {
    if (part.length === 1) {
      outParts[i] = `0${part}`;
    }
  });

  return `#${outParts.join('')}`;
}

export function hslaToRgba(hslaValues: number[]) {
  const h = hslaValues[0];
  let s = hslaValues[1];
  let l = hslaValues[2];
  const a = hslaValues?.[3] ?? 1;

  // Must be fractions of 1
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (h >= 300 && h < 360) {
    r = c;
    g = 0;
    b = x;
  }
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return [r, g, b, a];
}

function roundToTwo(num: number) {
  return +`${Math.round(Number(`${num}e+2`))}e-2`;
}

export function convertToFigmaColor(input: string) {
  let color: RGBA;
  let opacity;
  if (input.startsWith('rgb')) {
    const rgbValues = input.replace(/^rgba?\(|\s+|\)$/g, '').split(',').map(parseFloat) as WebRGBA;

    const {
      r, g, b, a = 1,
    } = webRGBToFigmaRGB(rgbValues);
    color = {
      r, g, b,
    };
    opacity = Number(a);
  } else if (input.startsWith('hsl')) {
    const hslValues = input.replace(/^hsla?\(|\s+|%|\)$/g, '').split(',').map(parseFloat);
    const rgbValues: any = hslaToRgba(hslValues);
    const {
      r, g, b, a = 1,
    } = webRGBToFigmaRGB(rgbValues);
    color = {
      r, g, b,
    };
    opacity = Number(a);
  } else {
    const {
      r, g, b, a = 1,
    }: RGBA = hexToFigmaRGB(toHex(input));
    color = {
      r, g, b,
    };
    opacity = roundToTwo(a);
  }

  return {
    color,
    opacity,
  };
}

export function convertFigmaColorToHex(color: RGBA | RGB, opacity?: number): string {
  if ('a' in color) {
    return figmaRGBToHex(color);
  }
  return figmaRGBToHex({ ...color, a: opacity });
}

export function convertFigmaPaintToHex(paint: SolidPaint): string {
  return convertFigmaColorToHex(paint.color, paint.opacity);
}

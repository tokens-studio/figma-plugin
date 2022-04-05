import { parseToRgba, toHex } from 'color2k';
import convertOpacityToFigma from '@/plugin/figmaTransforms/opacity';

// Convert non-conform colors to RGB value that can be used throughout the plugin
export function convertToRgb(color: string): string | null {
  try {
    if (typeof color !== 'string') {
      return color;
    }
    const hexRegex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/g;
    const hslaRegex = /(hsla?\(.*?\))/g;
    const rgbaRegex = /(rgba?\(.*?\))/g;
    let returnedColor = color;

    try {
      const matchesRgba = Array.from(returnedColor.matchAll(rgbaRegex), (m) => m[0]);
      const matchesHsla = Array.from(returnedColor.matchAll(hslaRegex), (m) => m[0]);
      if (matchesHsla.length > 0) {
        matchesHsla.forEach((match) => {
          returnedColor = returnedColor.replace(match, toHex(match));
        });
      }
      if (matchesRgba.length > 0) {
        matchesRgba.forEach((match) => {
          const matchedString = match;
          const matchedColor = match.replace(/rgba?\(/g, '').replace(')', '');
          const matchesHexInsideRgba = matchedColor.match(hexRegex);
          let r;
          let g;
          let b;
          let alpha = '1';
          if (matchesHexInsideRgba) {
            [r, g, b] = parseToRgba(matchesHexInsideRgba[0]);
            alpha = matchedColor.split(',').pop()?.trim() ?? '0';
          } else {
            [r, g, b, alpha = '1'] = matchedColor.split(',').map((n) => n.trim());
          }
          const a = convertOpacityToFigma(alpha);
          returnedColor = returnedColor.split(matchedString).join(toHex(`rgba(${r}, ${g}, ${b}, ${a})`));
        });
      }
    } catch (e) {
      console.log('error', e, color);
    }
    return returnedColor;
  } catch (e) {
    console.error(e);
  }

  return null;
}

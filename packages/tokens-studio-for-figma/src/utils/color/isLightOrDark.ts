import { readableColorIsBlack } from 'color2k';

// Light or dark check for Token Buttons: If color is very bright e.g. white we show a different style
export function lightOrDark(color: string) {
  if (typeof color !== 'string') {
    return 'light';
  }
  try {
    return readableColorIsBlack(color) ? 'light' : 'dark';
  } catch (e) {
    return 'light';
  }
}

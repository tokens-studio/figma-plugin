import { gradientTokenToCss, gradientTokenSummary, isGradientTokenValue } from './gradientTokenToCss';
import { TokenGradientValue } from '@/types/values';

describe('gradientTokenToCss', () => {
  it('builds a linear gradient', () => {
    const value: TokenGradientValue = {
      kind: 'linear',
      angle: 90,
      stops: [
        { color: '#ff0000', position: 0 },
        { color: '#0000ff', position: 1 },
      ],
    };
    expect(gradientTokenToCss(value)).toBe('linear-gradient(90deg, #ff0000 0%, #0000ff 100%)');
  });

  it('defaults linear angle to 180', () => {
    const value: TokenGradientValue = {
      kind: 'linear',
      stops: [
        { color: '#000000', position: 0 },
        { color: '#ffffff', position: 1 },
      ],
    };
    expect(gradientTokenToCss(value)).toBe('linear-gradient(180deg, #000000 0%, #ffffff 100%)');
  });

  it('sorts stops by position', () => {
    const value: TokenGradientValue = {
      kind: 'linear',
      angle: 180,
      stops: [
        { color: '#0000ff', position: 1 },
        { color: '#ff0000', position: 0 },
      ],
    };
    expect(gradientTokenToCss(value)).toBe('linear-gradient(180deg, #ff0000 0%, #0000ff 100%)');
  });

  it('builds a radial gradient with shape', () => {
    const value: TokenGradientValue = {
      kind: 'radial',
      shape: 'ellipse',
      stops: [
        { color: '#ffffff', position: 0 },
        { color: '#000000', position: 1 },
      ],
    };
    expect(gradientTokenToCss(value)).toBe('radial-gradient(ellipse, #ffffff 0%, #000000 100%)');
  });

  it('builds a conic gradient with start angle', () => {
    const value: TokenGradientValue = {
      kind: 'conic',
      startAngle: 45,
      stops: [
        { color: '#ff0000', position: 0 },
        { color: '#00ff00', position: 1 },
      ],
    };
    expect(gradientTokenToCss(value)).toBe('conic-gradient(from 45deg, #ff0000 0%, #00ff00 100%)');
  });

  it('falls back to a linear preview for diamond gradients', () => {
    const value: TokenGradientValue = {
      kind: 'diamond',
      size: 0.75,
      stops: [
        { color: '#ff5500', position: 0 },
        { color: '#0055ff', position: 1 },
      ],
    };
    expect(gradientTokenToCss(value)).toBe('linear-gradient(45deg, #ff5500 0%, #0055ff 100%)');
  });

  it('returns transparent when there are no stops', () => {
    expect(gradientTokenToCss({ kind: 'linear', stops: [] })).toBe('transparent');
  });
});

describe('gradientTokenSummary', () => {
  it('summarizes kind, angle and stop count', () => {
    expect(gradientTokenSummary({
      kind: 'linear',
      angle: 180,
      stops: [
        { color: '#000000', position: 0 },
        { color: '#ffffff', position: 1 },
      ],
    })).toBe('linear, 180°, 2 stops');
  });

  it('omits the angle when not set', () => {
    expect(gradientTokenSummary({
      kind: 'radial',
      stops: [{ color: '#000000', position: 0 }],
    })).toBe('radial, 1 stop');
  });
});

describe('isGradientTokenValue', () => {
  it('accepts gradient objects', () => {
    expect(isGradientTokenValue({ kind: 'linear', stops: [] })).toBe(true);
  });

  it('rejects strings, arrays and other objects', () => {
    expect(isGradientTokenValue('linear-gradient(180deg, #000 0%, #fff 100%)')).toBe(false);
    expect(isGradientTokenValue([{ color: '#000', position: 0 }])).toBe(false);
    expect(isGradientTokenValue({ color: '#000', width: '1px' })).toBe(false);
    expect(isGradientTokenValue(null)).toBe(false);
  });
});

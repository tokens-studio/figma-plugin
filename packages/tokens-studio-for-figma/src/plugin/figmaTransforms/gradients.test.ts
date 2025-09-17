import { convertDegreeToNumber, convertFigmaGradientToString, convertStringToFigmaGradient } from './gradients';

describe('convertStringtoFigmaGradient', () => {
  const test1 = {
    input: 'linear-gradient(45deg, #ffffff 0%, #000000 100%)',
    output: {
      type: 'GRADIENT_LINEAR',
      gradientStops: [
        {
          color: {
            a: 1,
            b: 1,
            g: 1,
            r: 1,
          },
          position: 0,
        },
        {
          color: {
            a: 1,
            b: 0,
            g: 0,
            r: 0,
          },
          position: 1,
        },
      ],
      gradientTransform: [
        [0.5, -0.5, 0.5],
        [0.5, 0.5, 0],
      ],
    },
  };

  const test2 = {
    input: 'linear-gradient(45deg, #ffffff 0%, rgba(255,0,0,0.5) 50%, #000000 100%)',
    output: {
      type: 'GRADIENT_LINEAR',
      gradientStops: [
        {
          color: {
            a: 1,
            b: 1,
            g: 1,
            r: 1,
          },
          position: 0,
        },
        {
          color: {
            a: 0.5,
            b: 0,
            g: 0,
            r: 1,
          },
          position: 0.5,
        },
        {
          color: {
            a: 1,
            b: 0,
            g: 0,
            r: 0,
          },
          position: 1,
        },
      ],
      gradientTransform: [
        [0.5, -0.5, 0.5],
        [0.5, 0.5, 0],
      ],
    },
  };

  const test3 = {
    input: 'linear-gradient(45deg, #ffffff 0%, rgba(255,0,0,0.5) 50%, #000000 100%)',
    output: {
      type: 'GRADIENT_LINEAR',
      gradientStops: [
        {
          color: {
            a: 1,
            b: 1,
            g: 1,
            r: 1,
          },
          position: 0,
        },
        {
          color: {
            a: 0.5,
            b: 0,
            g: 0,
            r: 1,
          },
          position: 0.5,
        },
        {
          color: {
            a: 1,
            b: 0,
            g: 0,
            r: 0,
          },
          position: 1,
        },
      ],
      gradientTransform: [
        [0.5, -0.5, 0.5],
        [0.5, 0.5, 0],
      ],
    },
  };

  const test4 = {
    input: 'linear-gradient(#000000, #ffffff)',
    output: {
      type: 'GRADIENT_LINEAR',
      gradientStops: [
        {
          color: {
            r: 0,
            g: 0,
            b: 0,
            a: 1,
          },
          position: 0,
        },
        {
          color: {
            r: 1,
            g: 1,
            b: 1,
            a: 1,
          },
          position: 1,
        },
      ],
      gradientTransform: [
        [0, 1, 0],
        [-1, 0, 1],
      ],
    },
  };

  const test5 = {
    input: 'linear-gradient(0.25turn, #e66465, #9198e5)',
    output: {
      type: 'GRADIENT_LINEAR',
      gradientStops: [
        {
          color: {
            r: 0.9019607843137255,
            g: 0.39215686274509803,
            b: 0.396078431372549,
            a: 1,
          },
          position: 0,
        },
        {
          color: {
            r: 0.5686274509803921,
            g: 0.596078431372549,
            b: 0.8980392156862745,
            a: 1,
          },
          position: 1,
        },
      ],
      gradientTransform: [[1, 0, 0], [0, 1, 0]],
    },
  };

  const test6 = {
    input: 'linear-gradient(to top, #e66465, #9198e5)',
    output: {
      type: 'GRADIENT_LINEAR',
      gradientStops: [
        {
          color: {
            r: 0.9019607843137255,
            g: 0.39215686274509803,
            b: 0.396078431372549,
            a: 1,
          },
          position: 0,
        },
        {
          color: {
            r: 0.5686274509803921,
            g: 0.596078431372549,
            b: 0.8980392156862745,
            a: 1,
          },
          position: 1,
        },
      ],
      gradientTransform: [
        [0, 1, 0],
        [-1, 0, 1],
      ],
    },
  };

  const test7 = {
    input: 'linear-gradient(106.84deg, #FF0000 5.61%, #cc00ff00 89.41%)',
    output: {
      type: 'GRADIENT_LINEAR',
      gradientStops: [
        {
          color: {
            r: 1,
            g: 0,
            b: 0,
            a: 1,
          },
          position: 0.056100000000000004,
        },
        {
          color: {
            r: 0.8,
            g: 0,
            b: 1,
            a: 0,
          },
          position: 0.8941,
        },
      ],
      gradientTransform: [
        [0.9160738743, 0.2772769934, -0.0966754339],
        [-0.2772769934, 0.9160738743, 0.1806015595],
      ],
    },
  };

  expect(convertStringToFigmaGradient(test1.input)).toEqual(test1.output);
  expect(convertStringToFigmaGradient(test2.input)).toEqual(test2.output);
  expect(convertStringToFigmaGradient(test3.input)).toEqual(test3.output);
  expect(convertStringToFigmaGradient(test4.input)).toEqual(test4.output);
  expect(convertStringToFigmaGradient(test5.input)).toEqual(test5.output);
  expect(convertStringToFigmaGradient(test6.input)).toEqual(test6.output);
  expect(convertStringToFigmaGradient(test7.input)).toEqual(test7.output);
});

describe('convertStringtoFigmaGradient with OKLCH colors', () => {
  it('should convert OKLCH colors in gradients', () => {
    // Test basic OKLCH gradient: white to red
    const oklchGradient = 'linear-gradient(45deg, oklch(1 0 0) 0%, oklch(0.627955 0.257704 29.2338) 100%)';
    const oklchResult = convertStringToFigmaGradient(oklchGradient);

    expect(oklchResult.gradientStops).toHaveLength(2);
    // First stop: OKLCH white
    expect(oklchResult.gradientStops[0].color.r).toBeCloseTo(1, 1);
    expect(oklchResult.gradientStops[0].color.g).toBeCloseTo(1, 1);
    expect(oklchResult.gradientStops[0].color.b).toBeCloseTo(1, 1);
    expect(oklchResult.gradientStops[0].color.a).toBe(1);
    expect(oklchResult.gradientStops[0].position).toBe(0);

    // Second stop: OKLCH red
    expect(oklchResult.gradientStops[1].color.r).toBeCloseTo(1, 1);
    expect(oklchResult.gradientStops[1].color.g).toBeCloseTo(0, 1);
    expect(oklchResult.gradientStops[1].color.b).toBeCloseTo(0, 1);
    expect(oklchResult.gradientStops[1].color.a).toBe(1);
    expect(oklchResult.gradientStops[1].position).toBe(1);

    expect(oklchResult.gradientTransform).toEqual([
      [0.5, -0.5, 0.5],
      [0.5, 0.5, 0],
    ]);
  });

  it('should convert OKLCH colors with alpha in gradients', () => {
    // Test gradient with OKLCH colors with alpha and mixed color formats
    const oklchAlphaGradient = 'linear-gradient(90deg, oklch(0.5 0.1 180 / 0.5) 0%, oklch(0.8 0.15 240) 50%, rgba(255,0,0,0.8) 100%)';
    const oklchAlphaResult = convertStringToFigmaGradient(oklchAlphaGradient);

    expect(oklchAlphaResult.gradientStops).toHaveLength(3);
    expect(oklchAlphaResult.gradientStops[0].color.a).toBe(0.5); // First OKLCH with alpha
    expect(oklchAlphaResult.gradientStops[1].color.a).toBe(1); // Second OKLCH without alpha
    expect(oklchAlphaResult.gradientStops[2].color.a).toBe(0.8); // RGBA color
    expect(oklchAlphaResult.gradientTransform).toEqual([
      [1, 0, 0],
      [0, 1, 0],
    ]);
  });
});

describe('convertFigmaGradientToString', () => {
  const test1: {
    input: GradientPaint;
    output: string;
  } = {
    input: {
      type: 'GRADIENT_LINEAR',
      gradientStops: [
        {
          color: {
            a: 1,
            b: 1,
            g: 1,
            r: 1,
          },
          position: 0,
        },
        {
          color: {
            a: 1,
            b: 0,
            g: 0,
            r: 0,
          },
          position: 1,
        },
      ],
      gradientTransform: [
        [0.7071067811865477, -0.7071067811865475, 0.49999999999999994],
        [0.7071067811865475, 0.7071067811865476, -0.2071067811865476],
      ],
    },
    output: 'linear-gradient(45deg, #ffffff 0%, #000000 100%)',
  };

  const test2: {
    input: GradientPaint;
    output: string;
  } = {
    input: {
      type: 'GRADIENT_LINEAR',
      gradientStops: [
        {
          color: {
            a: 1,
            b: 1,
            g: 1,
            r: 1,
          },
          position: 0,
        },
        {
          color: {
            a: 1,
            b: 0,
            g: 0,
            r: 1,
          },
          position: 0.535,
        },
        {
          color: {
            a: 1,
            b: 0,
            g: 0,
            r: 0,
          },
          position: 1,
        },
      ],
      gradientTransform: [
        [0.7071067811865476, -0.7071067811865475, 0.4999999999999999],
        [0.7071067811865475, 0.7071067811865476, -0.2071067811865476],
      ],
    },
    output: 'linear-gradient(45deg, #ffffff 0%, #ff0000 53.5%, #000000 100%)',
  };

  expect(convertFigmaGradientToString(test1.input)).toEqual(test1.output);
  expect(convertFigmaGradientToString(test2.input)).toEqual(test2.output);
});

describe('convertDegreeToNumber', () => {
  it('should convert degree to number', () => {
    expect(convertDegreeToNumber('90deg')).toEqual(90);
  });
});

describe('radial and conic gradients', () => {
  it('should convert radial gradient', () => {
    const result = convertStringToFigmaGradient('radial-gradient(#ff0000, #0000ff)');
    expect(result.type).toEqual('GRADIENT_RADIAL');
    expect(result.gradientStops).toHaveLength(2);
    expect(result.gradientStops[0].color).toEqual({
      r: 1, g: 0, b: 0, a: 1,
    });
    expect(result.gradientStops[1].color).toEqual({
      r: 0, g: 0, b: 1, a: 1,
    });
    expect(result.gradientTransform).toEqual([[1, 0, 0], [0, 1, 0]]);
  });

  it('should convert conic gradient', () => {
    const result = convertStringToFigmaGradient('conic-gradient(#ff0000, #0000ff)');
    expect(result.type).toEqual('GRADIENT_ANGULAR');
    expect(result.gradientStops).toHaveLength(2);
    expect(result.gradientStops[0].color).toEqual({
      r: 1, g: 0, b: 0, a: 1,
    });
    expect(result.gradientStops[1].color).toEqual({
      r: 0, g: 0, b: 1, a: 1,
    });
  });

  it('should convert conic gradient with from angle', () => {
    const result = convertStringToFigmaGradient('conic-gradient(from 45deg, #ff0000, #0000ff)');
    expect(result.type).toEqual('GRADIENT_ANGULAR');
    expect(result.gradientStops).toHaveLength(2);
  });

  it('should convert radial gradient with positions', () => {
    const result = convertStringToFigmaGradient('radial-gradient(#ff0000 0%, #0000ff 100%)');
    expect(result.type).toEqual('GRADIENT_RADIAL');
    expect(result.gradientStops).toHaveLength(2);
    expect(result.gradientStops[0].position).toEqual(0);
    expect(result.gradientStops[1].position).toEqual(1);
  });

  it('should fallback to linear gradient for unknown types', () => {
    const result = convertStringToFigmaGradient('unknown-gradient(#ff0000, #0000ff)');
    expect(result.type).toEqual('GRADIENT_LINEAR');
    expect(result.gradientStops).toHaveLength(2);
  });

  it('should handle radial gradient with shape/size parameters', () => {
    const result = convertStringToFigmaGradient('radial-gradient(circle at center, #ff0000, #0000ff)');
    expect(result.type).toEqual('GRADIENT_RADIAL');
    expect(result.gradientStops).toHaveLength(2);
  });

  it('should handle conic gradient with at position', () => {
    const result = convertStringToFigmaGradient('conic-gradient(from 45deg at 50% 50%, #ff0000, #0000ff)');
    expect(result.type).toEqual('GRADIENT_ANGULAR');
    expect(result.gradientStops).toHaveLength(2);
  });
});

describe('convertFigmaGradientToString with gradient types', () => {
  it('should convert GRADIENT_RADIAL to radial-gradient string', () => {
    const paint: GradientPaint = {
      type: 'GRADIENT_RADIAL',
      gradientStops: [
        {
          color: {
            r: 1, g: 0, b: 0, a: 1,
          },
          position: 0,
        },
        {
          color: {
            r: 0, g: 0, b: 1, a: 1,
          },
          position: 1,
        },
      ],
      gradientTransform: [[1, 0, 0], [0, 1, 0]],
    };
    const result = convertFigmaGradientToString(paint);
    expect(result).toEqual('radial-gradient(#ff0000 0%, #0000ff 100%)');
  });

  it('should convert GRADIENT_ANGULAR to conic-gradient string', () => {
    const paint: GradientPaint = {
      type: 'GRADIENT_ANGULAR',
      gradientStops: [
        {
          color: {
            r: 1, g: 0, b: 0, a: 1,
          },
          position: 0,
        },
        {
          color: {
            r: 0, g: 0, b: 1, a: 1,
          },
          position: 1,
        },
      ],
      gradientTransform: [[1, 0, 0], [0, 1, 0]],
    };
    const result = convertFigmaGradientToString(paint);
    expect(result).toEqual('conic-gradient(#ff0000 0%, #0000ff 100%)');
  });

  it('should convert GRADIENT_DIAMOND to radial-gradient string', () => {
    const paint: GradientPaint = {
      type: 'GRADIENT_DIAMOND',
      gradientStops: [
        {
          color: {
            r: 1, g: 0, b: 0, a: 1,
          },
          position: 0,
        },
        {
          color: {
            r: 0, g: 0, b: 1, a: 1,
          },
          position: 1,
        },
      ],
      gradientTransform: [[1, 0, 0], [0, 1, 0]],
    };
    const result = convertFigmaGradientToString(paint);
    expect(result).toEqual('radial-gradient(#ff0000 0%, #0000ff 100%)');
  });
});

import { convertDegreeToNumber, convertFigmaGradientToString, convertStringToFigmaGradient } from './gradients';

describe('convertStringtoFigmaGradient', () => {
  const test1 = {
    input: 'linear-gradient(45deg, #ffffff 0%, #000000 100%)',
    output: {
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
        [0.5000000000000001, -0.5, 0.49999999999999994],
        [0.5, 0.5000000000000001, -5.551115123125784e-17],
      ],
    },
  };

  const test2 = {
    input: 'linear-gradient(45deg, #ffffff 0%, rgba(255,0,0,0.5) 50%, #000000 100%)',
    output: {
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
        [0.5000000000000001, -0.5, 0.49999999999999994],
        [0.5, 0.5000000000000001, -5.551115123125784e-17],
      ],
    },
  };

  const test3 = {
    input: 'linear-gradient(45deg, #ffffff 0%, rgba(255,0,0,0.5) 50%, #000000 100%)',
    output: {
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
        [0.5000000000000001, -0.5, 0.49999999999999994],
        [0.5, 0.5000000000000001, -5.551115123125784e-17],
      ],
    },
  };

  expect(convertStringToFigmaGradient(test1.input)).toEqual(test1.output);
  expect(convertStringToFigmaGradient(test2.input)).toEqual(test2.output);
  expect(convertStringToFigmaGradient(test3.input)).toEqual(test3.output);
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

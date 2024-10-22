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
        [0.5, -0.5, 0.5],
        [0.5, 0.5, 0],
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
        [0.5, -0.5, 0.5],
        [0.5, 0.5, 0],
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
        [0.5, -0.5, 0.5],
        [0.5, 0.5, 0],
      ],
    },
  };

  const test4 = {
    input: 'linear-gradient(#000000, #ffffff)',
    output: {
      gradientStops: [
        {
          color: {
            r: 0,
            g: 0,
            b: 0,
            a: 1
          },
          position: 0
        },
        {
          color: {
            r: 1,
            g: 1,
            b: 1,
            a: 1
          },
          position: 1
        }
      ],
      gradientTransform: [
        [0, 1, 0],
        [-1, 0, 1],
      ],
    }
  };

  const test5 = {
    input: 'linear-gradient(0.25turn, #e66465, #9198e5)',
    output: {
      gradientStops: [
        {
          color: {
            r: 0.9019607843137255,
            g: 0.39215686274509803,
            b: 0.396078431372549,
            a: 1
          },
          position: 0
        },
        {
          color: {
            r: 0.5686274509803921,
            g: 0.596078431372549,
            b: 0.8980392156862745,
            a: 1
          },
          position: 1
        }
      ],
      gradientTransform: [[1, 0, 0], [0, 1, 0]]
    }
  };

  const test6 = {
    input: 'linear-gradient(to top, #e66465, #9198e5)',
    output: {
      gradientStops: [
        {
          color: {
            r: 0.9019607843137255,
            g: 0.39215686274509803,
            b: 0.396078431372549,
            a: 1
          },
          position: 0
        },
        {
          color: {
            r: 0.5686274509803921,
            g: 0.596078431372549,
            b: 0.8980392156862745,
            a: 1
          },
          position: 1
        }
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
    }
  }

  expect(convertStringToFigmaGradient(test1.input)).toEqual(test1.output);
  expect(convertStringToFigmaGradient(test2.input)).toEqual(test2.output);
  expect(convertStringToFigmaGradient(test3.input)).toEqual(test3.output);
  expect(convertStringToFigmaGradient(test4.input)).toEqual(test4.output);
  expect(convertStringToFigmaGradient(test5.input)).toEqual(test5.output);
  expect(convertStringToFigmaGradient(test6.input)).toEqual(test6.output);
  expect(convertStringToFigmaGradient(test7.input)).toEqual(test7.output);
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

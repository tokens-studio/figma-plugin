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
        [3.3038221562, 1, -1.6519110781],
        [-1, 3.3038221562, -0.6519110781],
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

describe('Gradient anchor points preservation', () => {
  it('should preserve exact anchor points from issue #2331', () => {
    // This test case reproduces the issue where gradient anchor points change
    // Original: linear-gradient(153.43deg, #AD00FF 0%, rgba(82, 255, 0, 0) 83.33%)
    // Expected to maintain the same positioning when converted back
    const originalGradient = 'linear-gradient(153.43deg, #AD00FF 0%, rgba(82, 255, 0, 0) 83.33%)';
    const figmaGradient = convertStringToFigmaGradient(originalGradient);
    
    // Check that the positions are preserved correctly
    expect(figmaGradient.gradientStops).toHaveLength(2);
    expect(figmaGradient.gradientStops[0].position).toBeCloseTo(0, 4); // 0%
    expect(figmaGradient.gradientStops[1].position).toBeCloseTo(0.8333, 4); // 83.33%
    
    // Convert back to string to verify round-trip preservation
    const backToString = convertFigmaGradientToString({
      type: 'GRADIENT_LINEAR',
      gradientStops: figmaGradient.gradientStops,
      gradientTransform: figmaGradient.gradientTransform,
    });
    
    // The positions should be preserved (allowing for rounding)
    expect(backToString).toMatch(/0%/);
    expect(backToString).toMatch(/83\.33%/);
  });

  it('should handle gradients with negative anchor points', () => {
    // Another case from the issue where gradients have negative positions
    const gradientWithNegative = 'linear-gradient(136.98deg, #AD00FF -28.11%, rgba(82, 255, 0, 0) 123.5%)';
    const figmaGradient = convertStringToFigmaGradient(gradientWithNegative);
    
    expect(figmaGradient.gradientStops).toHaveLength(2);
    expect(figmaGradient.gradientStops[0].position).toBeCloseTo(-0.2811, 4); // -28.11%
    expect(figmaGradient.gradientStops[1].position).toBeCloseTo(1.235, 4); // 123.5%
  });

  it('should demonstrate the specific issue from user comments', () => {
    // Test the specific transformation that users reported as problematic
    // They mentioned: "when applied to figma shapes, anchor points change"
    const testGradient = 'linear-gradient(153.43deg, #AD00FF 0%, rgba(82, 255, 0, 0) 83.33%)';
    
    // First conversion: CSS string -> Figma format
    const figmaFormat = convertStringToFigmaGradient(testGradient);
    console.log('First conversion - positions:', figmaFormat.gradientStops.map(s => s.position));
    
    // Second conversion: Figma format -> CSS string (what user sees when copying from Figma)
    const cssString = convertFigmaGradientToString({
      type: 'GRADIENT_LINEAR',
      gradientStops: figmaFormat.gradientStops,
      gradientTransform: figmaFormat.gradientTransform,
    });
    console.log('Round-trip result:', cssString);
    
    // The issue: positions might change from the original values
    // This test will help us understand what's happening
    expect(cssString).toContain('#ad00ff'); // Color should be preserved
    expect(cssString).toContain('153deg'); // Angle should be approximately preserved
    
    // Extract the percentages from the result to see if they match original
    const percentageMatches = cssString.match(/(\d+(?:\.\d+)?)%/g);
    if (percentageMatches) {
      console.log('Extracted percentages:', percentageMatches);
      // The first should be close to 0%, the second to 83.33%
      expect(parseFloat(percentageMatches[0])).toBeCloseTo(0, 1);
      expect(parseFloat(percentageMatches[1])).toBeCloseTo(83.33, 1);
    }
  });

  it('should reproduce the exact positioning issue reported by users', () => {
    // Test case that should fail and demonstrate the anchor point shifting issue
    // The users reported that 0% becomes 8.33% and 83.33% becomes 77.78%
    
    // Simulate what happens when a gradient is applied to a Figma shape
    // This uses realistic shape dimensions that might affect the calculation
    const originalGradient = 'linear-gradient(153.43deg, #AD00FF 0%, rgba(82, 255, 0, 0) 83.33%)';
    
    // Step 1: Convert to Figma format (what happens when token is applied)
    const figmaGradient = convertStringToFigmaGradient(originalGradient);
    
    // Step 2: Simulate what Figma would do internally - this is where the issue might occur
    // When gradient is applied to a shape, Figma interprets positions relative to the transform
    
    // Step 3: Convert back to CSS (what user sees when inspecting the shape)
    const resultGradient = convertFigmaGradientToString({
      type: 'GRADIENT_LINEAR',
      gradientStops: figmaGradient.gradientStops,
      gradientTransform: figmaGradient.gradientTransform,
    });
    
    console.log('Original gradient:', originalGradient);
    console.log('Result gradient:  ', resultGradient);
    
    // Extract positions to check for the reported drift
    const originalPositions = originalGradient.match(/(\d+(?:\.\d+)?)%/g);
    const resultPositions = resultGradient.match(/(\d+(?:\.\d+)?)%/g);
    
    console.log('Original positions:', originalPositions);
    console.log('Result positions:  ', resultPositions);
    
    // This test should currently pass but will help us understand the issue
    // When we implement the fix, we'll ensure positions are preserved exactly
    if (originalPositions && resultPositions) {
      const originalFirst = parseFloat(originalPositions[0]);
      const originalSecond = parseFloat(originalPositions[1]);
      const resultFirst = parseFloat(resultPositions[0]);
      const resultSecond = parseFloat(resultPositions[1]);
      
      // Check if we can reproduce the reported shift
      console.log(`Position drift: ${originalFirst}% → ${resultFirst}% (${(resultFirst - originalFirst).toFixed(2)}% shift)`);
      console.log(`Position drift: ${originalSecond}% → ${resultSecond}% (${(resultSecond - originalSecond).toFixed(2)}% shift)`);
      
      // For now, expect the positions to be preserved (this should pass with current implementation)
      expect(resultFirst).toBeCloseTo(originalFirst, 1);
      expect(resultSecond).toBeCloseTo(originalSecond, 1);
    }
  });

  it('should handle non-45-degree angles correctly (issue specific case)', () => {
    // Users reported that the issue only occurs with angles that are not 45° steps
    // Test various angles to see if we can reproduce the positioning issue
    
    const testCases = [
      { angle: 153.43, description: 'user reported problematic angle' },
      { angle: 136.98, description: 'another user reported angle' },
      { angle: 106.84, description: 'angle from existing test' },
      { angle: 45, description: 'should work (45° step)' },
      { angle: 90, description: 'should work (45° step)' },
      { angle: 135, description: 'should work (45° step)' },
      { angle: 67.5, description: 'non-45° step' },
      { angle: 22.5, description: 'non-45° step' },
    ];
    
    testCases.forEach(({ angle, description }) => {
      const originalGradient = `linear-gradient(${angle}deg, #FF0000 0%, #0000FF 100%)`;
      const figmaGradient = convertStringToFigmaGradient(originalGradient);
      const resultGradient = convertFigmaGradientToString({
        type: 'GRADIENT_LINEAR',
        gradientStops: figmaGradient.gradientStops,
        gradientTransform: figmaGradient.gradientTransform,
      });
      
      // Extract positions
      const originalPositions = originalGradient.match(/(\d+(?:\.\d+)?)%/g);
      const resultPositions = resultGradient.match(/(\d+(?:\.\d+)?)%/g);
      
      if (originalPositions && resultPositions) {
        const originalFirst = parseFloat(originalPositions[0]);
        const originalSecond = parseFloat(originalPositions[1]);
        const resultFirst = parseFloat(resultPositions[0]);
        const resultSecond = parseFloat(resultPositions[1]);
        
        const drift1 = Math.abs(resultFirst - originalFirst);
        const drift2 = Math.abs(resultSecond - originalSecond);
        
        console.log(`${angle}° (${description}): ${originalFirst}%→${resultFirst}% (${drift1.toFixed(2)}% drift), ${originalSecond}%→${resultSecond}% (${drift2.toFixed(2)}% drift)`);
        
        // Expect positions to be preserved within reasonable tolerance
        expect(drift1).toBeLessThan(0.1); // Less than 0.1% drift
        expect(drift2).toBeLessThan(0.1);
      }
    });
  });
});

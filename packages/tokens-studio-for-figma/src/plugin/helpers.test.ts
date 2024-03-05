import { transformValue } from './helpers';

describe('transformValue', () => {
  const tokens = [
    {
      input: '12px',
      type: 'spacing',
      output: 12,
    },
    {
      input: '12px',
      type: 'lineHeights',
      output: {
        unit: 'PIXELS',
        value: 12,
      },
    },
    {
      input: '160%',
      type: 'lineHeights',
      output: {
        unit: 'PERCENT',
        value: 160,
      },
    },
    {
      input: '24px',
      type: 'letterSpacing',
      output: {
        unit: 'PIXELS',
        value: 24,
      },
    },
    {
      input: '120%',
      type: 'letterSpacing',
      output: {
        unit: 'PERCENT',
        value: 120,
      },
    },
    {
      input: '120%',
      type: 'lineHeights',
      output: {
        unit: 'PERCENT',
        value: 120,
      },
    },
    {
      input: '2rem',
      type: 'sizing',
      output: 32,
    },
    {
      input: '0.24',
      type: 'sizing',
      output: 0.24,
    },
    {
      input: '50%',
      type: 'opacity',
      output: 0.5,
    },
    {
      input: '0.6',
      type: 'opacity',
      output: 0.6,
    },
    {
      input: '100',
      type: 'fontWeights',
      output: ['Thin', 'Hairline'],
    },
    {
      input: 'bold',
      type: 'fontWeights',
      output: [],
    },
  ];
  it('transforms non-conform values into their required formats', () => {
    tokens.forEach((token) => {
      expect(transformValue(token.input, token.type)).toEqual(token.output);
    });
  });
});

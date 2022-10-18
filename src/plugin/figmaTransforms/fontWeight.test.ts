import { convertFontWeightToFigma } from './fontWeight';

describe('fontWeight', () => {
  const fontWeights = [
    {
      input: '100',
      output: ['Thin', 'Hairline'],
    },
    {
      input: '200',
      output: ['ExtraLight', 'Extra Light', 'UltraLight', 'Ultra Light'],
    },
    {
      input: '300',
      output: ['Light'],
    },
    {
      input: '400',
      output: ['Regular', 'Normal'],
    },
    {
      input: '500',
      output: ['Medium'],
    },
    {
      input: '600',
      output: ['SemiBold', 'Semibold', 'Semi Bold', 'DemiBold', 'Demi Bold'],
    },
    {
      input: '700',
      output: ['Bold'],
    },
    {
      input: '800',
      output: ['ExtraBold', 'Extra Bold', 'UltraBold', 'Ultra Bold'],
    },
    {
      input: '900',
      output: ['Black', 'Heavy'],
    },
    {
      input: '450',
      output: [],
    },
  ];
  it('should convert numerical font weight to figma font weight', () => {
    fontWeights.forEach((fontWeight) => {
      expect(convertFontWeightToFigma(fontWeight.input)).toEqual(fontWeight.output);
    });
  });
});

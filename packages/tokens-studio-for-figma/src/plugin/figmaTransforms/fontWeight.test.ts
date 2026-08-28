import { convertFontWeightToFigma, fontWeightStyleCandidates } from './fontWeight';

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
      output: ['Light', 'Leicht'],
    },
    {
      input: '350',
      output: ['SemiLight', 'Semi Light', 'DemiLight', 'Demi Light'],
    },
    {
      input: '400',
      output: ['Regular', 'Normal', 'Book', 'Roman', 'Buch'],
    },
    {
      input: '500',
      output: ['Medium', 'Kraeftig', 'Kräftig'],
    },
    {
      input: '600',
      output: ['SemiBold', 'Semibold', 'Semi Bold', 'DemiBold', 'Demi Bold', 'Halbfett', 'Demi'],
    },
    {
      input: '700',
      output: ['Bold', 'Dreiviertelfett', 'Gras'],
    },
    {
      input: '800',
      output: ['ExtraBold', 'Extra Bold', 'UltraBold', 'Ultra Bold', 'Fett'],
    },
    {
      input: '900',
      output: ['Black', 'Heavy', 'Super', 'Extrafett'],
    },
    {
      input: '950',
      output: ['ExtraBlack', 'Extra Black', 'UltraBlack', 'Ultra Black'],
    },
    {
      input: '450',
      output: ['450'],
    },
    {
      input: 'Book',
      output: ['Book'],
    },
  ];
  it('should convert numerical font weight to figma font weight', () => {
    fontWeights.forEach((fontWeight) => {
      expect(convertFontWeightToFigma(fontWeight.input)).toEqual(fontWeight.output);
      expect(fontWeightStyleCandidates(fontWeight.input)).toEqual(fontWeight.output);
    });
  });

  it('returns the raw value when shouldOutputForVariables is true', () => {
    expect(convertFontWeightToFigma('400', true)).toEqual(['400']);
    expect(convertFontWeightToFigma('Book', true)).toEqual(['Book']);
  });
});

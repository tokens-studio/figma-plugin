export function convertFontWeightToFigma(value: string, shouldOutputForVariables = false): string[] {
  if (shouldOutputForVariables) {
    return [value];
  }

  switch (value) {
    case '100':
      return ['Thin', 'Hairline'];
    case '200':
      return ['ExtraLight', 'Extra Light', 'UltraLight', 'Ultra Light'];
    case '300':
      return ['Light', 'Leicht'];
    case '350':
      return ['SemiLight', 'Semi Light', 'DemiLight', 'Demi Light'];
    case '400':
      return ['Regular', 'Normal', 'Book', 'Roman', 'Buch'];
    case '500':
      return ['Medium', 'Kraeftig', 'Kräftig'];
    case '600':
      return ['SemiBold', 'Semibold', 'Semi Bold', 'DemiBold', 'Demi Bold', 'Halbfett', 'Demi'];
    case '700':
      return ['Bold', 'Dreiviertelfett', 'Gras'];
    case '800':
      return ['ExtraBold', 'Extra Bold', 'UltraBold', 'Ultra Bold', 'Fett'];
    case '900':
      return ['Black', 'Heavy', 'Super', 'Extrafett'];
    case '950':
      return ['ExtraBlack', 'Extra Black', 'UltraBlack', 'Ultra Black'];
    default:
      return [value];
  }
}

export function fontWeightStyleCandidates(value: string): string[] {
  return convertFontWeightToFigma(value, false);
}

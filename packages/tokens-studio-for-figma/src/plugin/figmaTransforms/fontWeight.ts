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
    case '400':
      return ['Regular', 'Normal', 'Book', 'Roman', 'Buch'];
    case '500':
      return ['Medium', 'Kraeftig', 'Kräftig'];
    case '600':
      return ['SemiBold', 'Semibold', 'Semi Bold', 'DemiBold', 'Demi Bold', 'Halbfett'];
    case '700':
      return ['Bold', 'Dreiviertelfett'];
    case '800':
      return ['ExtraBold', 'Extra Bold', 'UltraBold', 'Ultra Bold', 'Fett'];
    case '900':
      return ['Black', 'Heavy', 'Super', 'Extrafett'];
    default:
      return [value];
  }
}

export function fontWeightStyleCandidates(value: string): string[] {
  return convertFontWeightToFigma(value, false);
}

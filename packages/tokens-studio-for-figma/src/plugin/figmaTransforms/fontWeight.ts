export function convertFontWeightToFigma(value: string, shouldOutputForVariables = false): string[] {
  if (shouldOutputForVariables) {
    return [value];
  }

  switch (value) {
    case '100':
      return ['Thin', 'Hairline'];
    case '200':
      return ['ExtraLight', 'Extra Light', 'UltraLight', 'Ultra Light', 'ultraleicht'];
    case '300':
      return ['Light', 'leicht'];
    case '400':
      return ['Regular', 'Normal', 'buch'];
    case '500':
      return ['Medium', 'kraeftig', 'kräftig'];
    case '600':
      return ['Semibold', 'SemiBold', 'Semi Bold', 'DemiBold', 'Demi Bold', 'halbfett'];
    case '700':
      return ['Bold', 'dreiviertelfett'];
    case '800':
      return ['ExtraBold', 'Extra Bold', 'UltraBold', 'Ultra Bold', 'fett'];
    case '900':
      return ['Black', 'Heavy', 'extrafett'];
    case '950':
      return ['Extra Black', 'Ultra Black'];
    default:
      return [value];
  }
}


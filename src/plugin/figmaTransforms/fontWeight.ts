export function convertFontWeightToFigma(value: string) {
  switch (value) {
    case '100':
      return ['Thin', 'Hairline'];
    case '200':
      return ['ExtraLight', 'Extra Light', 'UltraLight', 'Ultra Light'];
    case '300':
      return ['Light'];
    case '400':
      return ['Regular', 'Normal'];
    case '500':
      return ['Medium'];
    case '600':
      return ['SemiBold', 'Semibold', 'Semi Bold', 'DemiBold', 'Demi Bold'];
    case '700':
      return ['Bold'];
    case '800':
      return ['ExtraBold', 'Extra Bold', 'UltraBold', 'Ultra Bold'];
    case '900':
      return ['Black', 'Heavy'];
    default:
      return [];
  }
}

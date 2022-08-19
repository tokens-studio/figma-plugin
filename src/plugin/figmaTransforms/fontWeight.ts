export function convertFontWeightToFigma(value: string) {
  console.log('ttttvalue', value, typeof value, value === '600');
  switch (value) {
    case '100':
      return 'Thin';
    case '200':
      return 'Ultralight';
    case '300':
      return 'Light';
    case '400':
      return 'Regular';
    case '500':
      return 'Medium';
    case '600':
      return 'SemiBold';
    case '700':
      return 'Bold';
    case '800':
      return 'Ultrabold';
    case '900':
      return 'Black';
    default:
      return value;
  }
}

export function convertFigmaToFontWeight(value: string) {
  switch (value) {
    case 'Thin':
      return '100';
    case 'Ultralight':
      return '200';
    case 'Light':
      return '300';
    case 'Regular':
      return '400';
    case 'Medium':
      return '500';
    case 'SemiBold':
      return '600';
    case 'Bold':
      return '700';
    case 'Ultrabold':
      return '800';
    case 'Black':
      return '900';
    default:
      return value;
  }
}

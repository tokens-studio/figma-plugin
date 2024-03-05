export function convertTextDecorationToFigma(value: string) {
  switch (value.toLowerCase()) {
    case 'underline':
      return 'UNDERLINE';
    case 'line-through':
    case 'strikethrough':
      return 'STRIKETHROUGH';
    default:
      return 'NONE';
  }
}

export function convertFigmaToTextDecoration(value: string) {
  switch (value) {
    case 'UNDERLINE':
      return 'underline';
    case 'STRIKETHROUGH':
      return 'line-through';
    default:
      return 'none';
  }
}

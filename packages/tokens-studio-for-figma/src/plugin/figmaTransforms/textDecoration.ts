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

export function convertFigmaToTextDecoration(value: string | null | undefined): string {
  if (!value || typeof value !== 'string') {
    return 'none';
  }

  switch (value) {
    case 'UNDERLINE':
      return 'underline';
    case 'STRIKETHROUGH':
      return 'line-through';
    default:
      return 'none';
  }
}

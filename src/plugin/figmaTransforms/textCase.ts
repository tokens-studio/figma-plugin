export function convertTextCaseToFigma(value: string): TextCase {
  switch (value.toLowerCase()) {
    case 'uppercase':
    case 'upper':
      return 'UPPER';
    case 'lowercase':
    case 'lower':
      return 'LOWER';
    case 'capitalize':
    case 'title':
      return 'TITLE';
    case 'small-caps':
    case 'small_caps':
      return 'SMALL_CAPS' as TextCase; // @TODO not sure if these are supported
    case 'all-small-caps':
    case 'small_caps_forced':
      return 'SMALL_CAPS_FORCED' as TextCase; // @TODO not sure if these are supported
    default:
      return 'ORIGINAL';
  }
}

export function convertFigmaToTextCase(value: string) {
  switch (value) {
    case 'UPPER':
      return 'uppercase';
    case 'LOWER':
      return 'lowercase';
    case 'TITLE':
      return 'capitalize';
    case 'SMALL_CAPS':
      return 'small_caps';
    case 'SMALL_CAPS_FORCED':
      return 'small_caps_forced';
    default:
      return 'none';
  }
}

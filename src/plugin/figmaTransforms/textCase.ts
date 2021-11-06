export function convertTextCaseToFigma(value: string) {
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
        default:
            return 'none';
    }
}

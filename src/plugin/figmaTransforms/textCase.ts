export default function convertTextCaseToFigma(value: string) {
    switch (value.toLowerCase()) {
        case 'upper':
            return 'UPPER';
        case 'lower':
            return 'LOWER';
        case 'title':
            return 'TITLE';
        default:
            return 'ORIGINAL';
    }
}

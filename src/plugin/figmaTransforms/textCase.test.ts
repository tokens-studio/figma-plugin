import {convertFigmaToTextCase, convertTextCaseToFigma} from './textCase';

describe('convertTextCaseToFigma', () => {
    it('converts text case to figma compliant string', () => {
        expect(convertTextCaseToFigma('none')).toBe('ORIGINAL');
        expect(convertTextCaseToFigma('original')).toBe('ORIGINAL');
        expect(convertTextCaseToFigma('capitalize')).toBe('TITLE');
        expect(convertTextCaseToFigma('title')).toBe('TITLE');
        expect(convertTextCaseToFigma('lowercase')).toBe('LOWER');
        expect(convertTextCaseToFigma('lower')).toBe('LOWER');
        expect(convertTextCaseToFigma('uppercase')).toBe('UPPER');
        expect(convertTextCaseToFigma('upper')).toBe('UPPER');
    });
    it('converts non-compliant textCase to ORIGINAL', () => {
        expect(convertTextCaseToFigma('something')).toBe('ORIGINAL');
    });
});

describe('convertFigmaToTextCase', () => {
    it('converts figma text case to token compliant string', () => {
        expect(convertFigmaToTextCase('ORIGINAL')).toBe('none');
        expect(convertFigmaToTextCase('LOWER')).toBe('lowercase');
        expect(convertFigmaToTextCase('UPPER')).toBe('uppercase');
        expect(convertFigmaToTextCase('TITLE')).toBe('capitalize');
    });
});

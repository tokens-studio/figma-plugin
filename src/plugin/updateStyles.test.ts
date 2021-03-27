import updateStyles from './updateStyles';
import * as updateColorStyles from './updateColorStyles';
import * as updateTextStyles from './updateTextStyles';

describe('updateStyles', () => {
    const colorSpy = jest.spyOn(updateColorStyles, 'default');
    const textSpy = jest.spyOn(updateTextStyles, 'default');

    it('returns if no values are given', () => {
        updateStyles({borderRadius: {small: '3'}});
        expect(colorSpy).not.toHaveBeenCalled();
        expect(textSpy).not.toHaveBeenCalled();
    });

    it('calls update functions with correct tokens when all tokens are given', () => {
        const colorTokens = {
            primary: {
                '500': '#ff0000',
            },
        };

        const typographyTokens = {
            heading: {
                h1: {
                    fontFamily: 'Inter',
                    fontWeight: 'Regular',
                    fontSize: 24,
                },
            },
        };
        updateStyles({typography: typographyTokens, colors: colorTokens});
        expect(colorSpy).toHaveBeenCalledWith(colorTokens, false);
        expect(textSpy).toHaveBeenCalledWith(typographyTokens, false);
    });

    it('calls update functions with correct tokens for color tokens', () => {
        const colorTokens = {
            primary: {
                '500': '#ff0000',
            },
        };

        updateStyles({colors: colorTokens});
        expect(colorSpy).toHaveBeenCalledWith(colorTokens, false);
        expect(textSpy).not.toHaveBeenCalled();
    });

    it('calls update functions with correct tokens for coltextor tokens', () => {
        const typographyTokens = {
            heading: {
                h1: {
                    fontFamily: 'Inter',
                    fontWeight: 'Regular',
                    fontSize: 24,
                },
            },
        };

        updateStyles({typography: typographyTokens});
        expect(textSpy).toHaveBeenCalledWith(typographyTokens, false);
        expect(colorSpy).not.toHaveBeenCalled();
    });
});

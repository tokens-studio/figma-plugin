import * as setTextValuesOnTarget from './setTextValuesOnTarget';
import updateTextStyles from './updateTextStyles';

const setTextValuesOnTargetSpy = jest.spyOn(setTextValuesOnTarget, 'default');

const typographyTokens = {
    H1: {
        withValue: {
            value: {
                fontFamily: 'Inter',
                fontWeight: 'Bold',
                lineHeight: 'AUTO',
                fontSize: '48',
                paragraphSpacing: '48',
                letterSpacing: '-5%',
            },
        },
        withValueDescription: {
            value: {
                fontFamily: 'Inter',
                fontWeight: 'Regular',
                lineHeight: 'AUTO',
                fontSize: '36',
                paragraphSpacing: '24',
                letterSpacing: '-5%',
            },
            description: 'A standard description',
        },
        basic: {
            fontFamily: 'Inter',
            fontWeight: 'Bold',
            lineHeight: 'AUTO',
            fontSize: '24',
            paragraphSpacing: '14',
            letterSpacing: '-5%',
            description: 'No value token',
        },
        basicWithoutDescription: {
            fontFamily: 'Inter',
            fontWeight: 'Regular',
            lineHeight: 'AUTO',
            fontSize: '18',
            paragraphSpacing: '24',
            letterSpacing: '-5%',
        },
    },
};

const matchingFigmaStyle = {
    name: 'H1/withValue',
    fontName: {
        family: 'Inter',
        style: 'Bold',
    },
};

describe('updateTextStyles', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('initiates style creation when no match is found and should create', async () => {
        const newStyle = {id: '123'};
        figma.getLocalTextStyles.mockReturnValue([]);
        figma.createTextStyle.mockReturnValue(newStyle);
        await updateTextStyles(typographyTokens, true);
        expect(setTextValuesOnTargetSpy).toHaveBeenCalledTimes(4);
        expect(setTextValuesOnTargetSpy).toHaveBeenLastCalledWith(
            {...newStyle, name: 'H1/basicWithoutDescription'},
            {value: typographyTokens.H1.basicWithoutDescription}
        );
    });

    it('calls functions with correct transformed values when a matching style was found', () => {
        figma.getLocalTextStyles.mockReturnValueOnce([matchingFigmaStyle]);
        updateTextStyles(typographyTokens);
        expect(setTextValuesOnTargetSpy).toHaveBeenCalledWith(matchingFigmaStyle, typographyTokens.H1.withValue);
    });
});

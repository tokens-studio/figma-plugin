import * as setTextValuesOnTarget from './setTextValuesOnTarget';
import updateTextStyles from './updateTextStyles';
import type { SingleTypographyToken } from '@/types/tokens';

type ExtendedSingleToken = SingleTypographyToken<true, { path: string, styleId: string }>;

const setTextValuesOnTargetSpy = jest.spyOn(setTextValuesOnTarget, 'default');

const typographyTokens = [
  {
    name: 'H1.withValue',
    path: 'H1/withValue',
    value: {
      fontFamily: 'Inter',
      fontWeight: 'Bold',
      lineHeight: 'AUTO',
      fontSize: '48',
      paragraphSpacing: '48',
      letterSpacing: '-5%',
    },
    styleId: '',
  },
  {
    name: 'H1.withValueDescription',
    path: 'H1/withValueDescription',
    value: {
      fontFamily: 'Inter',
      fontWeight: 'Regular',
      lineHeight: 'AUTO',
      fontSize: '36',
      paragraphSpacing: '24',
      letterSpacing: '-5%',
    },
    styleId: '1234',
    description: 'A standard description',
  },
] as ExtendedSingleToken[];

const matchingFigmaStyle = {
  name: 'H1/withValue',
  fontName: {
    family: 'Inter',
    style: 'Bold',
  },
  id: '1234',
};

describe('updateTextStyles', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('initiates style creation when no match is found and should create', async () => {
    const newStyle = { id: '123' };
    const baseFontSize = '16';
    figma.getLocalTextStyles.mockReturnValue([]);
    figma.createTextStyle.mockReturnValue(newStyle);
    updateTextStyles(typographyTokens, baseFontSize, true);
    expect(setTextValuesOnTargetSpy).toHaveBeenCalledTimes(2);
    expect(setTextValuesOnTargetSpy).toHaveBeenLastCalledWith(
      { ...newStyle, name: 'H1/withValueDescription' },
      typographyTokens.find((t) => t.name === 'H1.withValueDescription'),
      baseFontSize,
    );
  });

  it('calls functions with correct transformed values when a matching style was found', () => {
    const baseFontSize = '16';
    figma.getLocalTextStyles.mockReturnValue([matchingFigmaStyle]);
    updateTextStyles(typographyTokens, baseFontSize);
    expect(setTextValuesOnTargetSpy).toHaveBeenCalledWith(
      matchingFigmaStyle,
      typographyTokens.find((t) => t.name === 'H1.withValue'),
      baseFontSize,
    );
  });
});

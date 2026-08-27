import { mockLoadFontAsync, mockNotify } from '../../tests/__mocks__/figmaMock';
import { setFontStyleOnTarget } from './setFontStyleOnTarget';

function mockAvailableFonts(family: string, styles: string[]) {
  (figma.listAvailableFontsAsync as jest.Mock).mockResolvedValue(
    styles.map((style) => ({ fontName: { family, style } })),
  );
  mockLoadFontAsync.mockImplementation(async (fontName: FontName) => {
    const exists = fontName.family === family && styles.includes(fontName.style);
    if (!exists) {
      throw new Error('Font not available');
    }
  });
}

describe('setFontStyleOnTarget', () => {
  let target: { fontName: FontName };

  beforeEach(() => {
    target = {
      fontName: { family: 'Inter', style: 'Regular' },
    };
  });

  it('applies Gotham SSm Book for numeric 400', async () => {
    mockAvailableFonts('Gotham SSm', ['Book', 'Medium', 'Bold']);

    await setFontStyleOnTarget({
      target: target as unknown as TextNode,
      value: { fontFamily: 'Gotham SSm', fontWeight: '400' },
      baseFontSize: '16',
    });

    expect(target.fontName).toEqual({ family: 'Gotham SSm', style: 'Book' });
    expect(mockNotify).not.toHaveBeenCalled();
  });

  it('applies Inter Regular for numeric 400', async () => {
    mockAvailableFonts('Inter', ['Regular', 'Medium', 'Bold']);

    await setFontStyleOnTarget({
      target: target as unknown as TextNode,
      value: { fontFamily: 'Inter', fontWeight: '400' },
      baseFontSize: '16',
    });

    expect(target.fontName).toEqual({ family: 'Inter', style: 'Regular' });
    expect(mockNotify).not.toHaveBeenCalled();
  });

  it('applies Book when the token weight is already Book', async () => {
    mockAvailableFonts('Gotham SSm', ['Book', 'Medium', 'Bold']);

    await setFontStyleOnTarget({
      target: target as unknown as TextNode,
      value: { fontFamily: 'Gotham SSm', fontWeight: 'Book' },
      baseFontSize: '16',
    });

    expect(target.fontName).toEqual({ family: 'Gotham SSm', style: 'Book' });
    expect(mockNotify).not.toHaveBeenCalled();
  });

  it('toasts when no family/weight combination can be loaded', async () => {
    mockAvailableFonts('Gotham SSm', ['Medium']);

    await setFontStyleOnTarget({
      target: target as unknown as TextNode,
      value: { fontFamily: 'Gotham SSm', fontWeight: '400' },
      baseFontSize: '16',
    });

    expect(target.fontName).toEqual({ family: 'Inter', style: 'Regular' });
    expect(mockNotify).toHaveBeenCalledWith('Error setting font family/weight combination for Gotham SSm/400', undefined);
  });
});

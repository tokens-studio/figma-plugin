import pullStyles from './pullStyles';
import * as notifiers from './notifiers';

describe('pullStyles crash scenarios', () => {
  const notifyStyleValuesSpy = jest.spyOn(notifiers, 'notifyStyleValues');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle malformed text styles without crashing', async () => {
    figma.getLocalTextStyles.mockReturnValue([
      // Style with missing fontName
      {
        name: 'broken/style1',
        id: '456',
        fontSize: 24,
        fontName: undefined, // This would cause a crash
        lineHeight: { unit: 'AUTO' },
        paragraphSpacing: 0,
        paragraphIndent: 0,
        letterSpacing: { unit: 'PERCENT', value: 0 },
        textCase: 'ORIGINAL',
        textDecoration: 'NONE',
      },
      // Style with missing properties
      {
        name: 'broken/style2',
        id: '457',
        fontSize: undefined, // This would cause issues
        fontName: { family: 'Inter', style: 'Bold' },
        lineHeight: undefined, // This would cause a crash
        paragraphSpacing: undefined,
        paragraphIndent: undefined,
        letterSpacing: undefined,
        textCase: undefined, // This would cause a crash in toString()
        textDecoration: undefined, // This would cause a crash in toString()
      },
      // Valid style to ensure processing continues
      {
        name: 'valid/style',
        id: '458',
        fontSize: 16,
        fontName: { family: 'Inter', style: 'Regular' },
        lineHeight: { unit: 'AUTO' },
        paragraphSpacing: 0,
        paragraphIndent: 0,
        letterSpacing: { unit: 'PERCENT', value: 0 },
        textCase: 'ORIGINAL',
        textDecoration: 'NONE',
      },
    ]);

    figma.variables.getLocalVariables.mockReturnValue([]);

    // This should not throw an error
    await expect(pullStyles({ textStyles: true })).resolves.not.toThrow();

    // Should still process the valid style
    expect(notifyStyleValuesSpy).toHaveBeenCalled();
  });

  it('should handle text styles with null properties', async () => {
    figma.getLocalTextStyles.mockReturnValue([
      {
        name: 'null/style',
        id: '459',
        fontSize: 24,
        fontName: { family: null, style: null }, // Null properties
        lineHeight: null,
        paragraphSpacing: null,
        paragraphIndent: null,
        letterSpacing: null,
        textCase: null,
        textDecoration: null,
      },
    ]);

    figma.variables.getLocalVariables.mockReturnValue([]);

    // This should not throw an error
    await expect(pullStyles({ textStyles: true })).resolves.not.toThrow();
  });

  it('should handle text styles with invalid property types', async () => {
    figma.getLocalTextStyles.mockReturnValue([
      {
        name: 'invalid/style',
        id: '460',
        fontSize: 'not-a-number', // Invalid type
        fontName: 'not-an-object', // Invalid type
        lineHeight: 'not-an-object', // Invalid type
        paragraphSpacing: 'not-a-number',
        paragraphIndent: 'not-a-number',
        letterSpacing: 'not-an-object',
        textCase: 123, // Invalid type
        textDecoration: true, // Invalid type
      },
    ]);

    figma.variables.getLocalVariables.mockReturnValue([]);

    // This should not throw an error
    await expect(pullStyles({ textStyles: true })).resolves.not.toThrow();
  });

  it('should handle empty fontName object', async () => {
    figma.getLocalTextStyles.mockReturnValue([
      {
        name: 'empty/fontname',
        id: '461',
        fontSize: 24,
        fontName: {}, // Empty object - no family or style properties
        lineHeight: { unit: 'AUTO' },
        paragraphSpacing: 0,
        paragraphIndent: 0,
        letterSpacing: { unit: 'PERCENT', value: 0 },
        textCase: 'ORIGINAL',
        textDecoration: 'NONE',
      },
    ]);

    figma.variables.getLocalVariables.mockReturnValue([]);

    // This should not throw an error
    await expect(pullStyles({ textStyles: true })).resolves.not.toThrow();
  });
});

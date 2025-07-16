import { updateAliasesInState } from '@/app/store/utils/updateAliasesInState';
import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken } from '@/types/tokens';

describe('Number Token Type Preservation', () => {
  it('should preserve number type when updating aliases', () => {
    const tokens = {
      core: [
        {
          name: 'spacing.base',
          type: TokenTypes.SPACING,
          value: 14, // This is a number, not a string
        } as SingleToken,
        {
          name: 'spacing.large',
          type: TokenTypes.SPACING,
          value: '{spacing.base}', // This references the above token
        } as SingleToken,
      ],
    };

    const renameData = {
      oldName: 'spacing.base',
      newName: 'spacing.baseSize',
    };

    const { updatedTokens } = updateAliasesInState(tokens, renameData);

    // The first token should maintain its number type
    const baseToken = updatedTokens.core.find((token) => token.name === 'spacing.base');
    expect(baseToken?.value).toBe(14);
    expect(typeof baseToken?.value).toBe('number');

    // The second token should have the reference updated but remain a string
    const largeToken = updatedTokens.core.find((token) => token.name === 'spacing.large');
    expect(largeToken?.value).toBe('{spacing.baseSize}');
    expect(typeof largeToken?.value).toBe('string');
  });

  it('should preserve number type in composite token values', () => {
    const tokens = {
      core: [
        {
          name: 'typography.base',
          type: TokenTypes.TYPOGRAPHY,
          value: {
            fontSize: 16, // This is a number
            lineHeight: 1.5, // This is also a number
            fontFamily: 'Arial', // This is a string
          },
        } as SingleToken,
      ],
    };

    const renameData = {
      oldName: 'typography.old',
      newName: 'typography.new',
    };

    const { updatedTokens } = updateAliasesInState(tokens, renameData);

    const typographyToken = updatedTokens.core.find((token) => token.name === 'typography.base');
    expect(typographyToken?.value).toEqual({
      fontSize: 16, // Should remain a number
      lineHeight: 1.5, // Should remain a number
      fontFamily: 'Arial', // Should remain a string
    });

    // Verify types explicitly
    const value = typographyToken?.value as Record<string, any>;
    expect(typeof value.fontSize).toBe('number');
    expect(typeof value.lineHeight).toBe('number');
    expect(typeof value.fontFamily).toBe('string');
  });

  it('should preserve number type in array token values', () => {
    const tokens = {
      core: [
        {
          name: 'boxShadow.base',
          type: TokenTypes.BOX_SHADOW,
          value: [
            {
              x: 2, // Number
              y: 4, // Number
              blur: 8, // Number
              spread: 0, // Number
              color: '#000000', // String
            },
          ],
        } as SingleToken,
      ],
    };

    const renameData = {
      oldName: 'shadow.old',
      newName: 'shadow.new',
    };

    const { updatedTokens } = updateAliasesInState(tokens, renameData);

    const shadowToken = updatedTokens.core.find((token) => token.name === 'boxShadow.base');
    const shadowValue = shadowToken?.value as Array<Record<string, any>>;

    expect(shadowValue[0]).toEqual({
      x: 2, // Should remain a number
      y: 4, // Should remain a number
      blur: 8, // Should remain a number
      spread: 0, // Should remain a number
      color: '#000000', // Should remain a string
    });

    // Verify types explicitly
    expect(typeof shadowValue[0].x).toBe('number');
    expect(typeof shadowValue[0].y).toBe('number');
    expect(typeof shadowValue[0].blur).toBe('number');
    expect(typeof shadowValue[0].spread).toBe('number');
    expect(typeof shadowValue[0].color).toBe('string');
  });

  it('should only convert to string when actual reference replacement occurs', () => {
    const tokens = {
      core: [
        {
          name: 'spacing.small',
          type: TokenTypes.SPACING,
          value: 8, // Number that should not be touched
        } as SingleToken,
        {
          name: 'spacing.reference',
          type: TokenTypes.SPACING,
          value: '{spacing.base}', // String with reference that should be updated
        } as SingleToken,
      ],
    };

    const renameData = {
      oldName: 'spacing.base',
      newName: 'spacing.newBase',
    };

    const { updatedTokens } = updateAliasesInState(tokens, renameData);

    // Token without reference should maintain number type
    const smallToken = updatedTokens.core.find((token) => token.name === 'spacing.small');
    expect(smallToken?.value).toBe(8);
    expect(typeof smallToken?.value).toBe('number');

    // Token with reference should have string updated
    const referenceToken = updatedTokens.core.find((token) => token.name === 'spacing.reference');
    expect(referenceToken?.value).toBe('{spacing.newBase}');
    expect(typeof referenceToken?.value).toBe('string');
  });
});

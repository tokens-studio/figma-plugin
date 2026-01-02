import { themeObjectSchema } from './themeObjectSchema';
import { TokenSetStatus } from '@/constants/TokenSetStatus';

describe('themeObjectSchema', () => {
  it('validates a basic theme object without extended fields', () => {
    const basicTheme = {
      id: 'theme-1',
      name: 'Light Theme',
      selectedTokenSets: {
        global: TokenSetStatus.ENABLED,
        semantic: TokenSetStatus.SOURCE,
      },
    };

    const result = themeObjectSchema.safeParse(basicTheme);
    expect(result.success).toBe(true);
  });

  it('validates a theme object with all optional fields', () => {
    const fullTheme = {
      id: 'theme-2',
      name: 'Dark Theme',
      group: 'Brand A',
      selectedTokenSets: {
        global: TokenSetStatus.ENABLED,
      },
      $figmaStyleReferences: {
        'color.primary': 'S:style-id-1',
      },
      $figmaVariableReferences: {
        'color.background': 'VariableID:123',
      },
      $figmaCollectionId: 'VariableCollectionId:456',
      $figmaModeId: '1:0',
    };

    const result = themeObjectSchema.safeParse(fullTheme);
    expect(result.success).toBe(true);
  });

  it('validates a theme with $extendsThemeId field', () => {
    const extendedTheme = {
      id: 'theme-child',
      name: 'Brand A Light',
      selectedTokenSets: {
        global: TokenSetStatus.ENABLED,
      },
      $extendsThemeId: 'theme-base',
    };

    const result = themeObjectSchema.safeParse(extendedTheme);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.$extendsThemeId).toBe('theme-base');
    }
  });

  it('validates a theme with $figmaParentCollectionId field', () => {
    const extendedTheme = {
      id: 'theme-child',
      name: 'Brand A Light',
      selectedTokenSets: {
        global: TokenSetStatus.ENABLED,
      },
      $figmaParentCollectionId: 'VariableCollectionId:parent:123',
    };

    const result = themeObjectSchema.safeParse(extendedTheme);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.$figmaParentCollectionId).toBe('VariableCollectionId:parent:123');
    }
  });

  it('validates a theme with both extended collection fields', () => {
    const fullyExtendedTheme = {
      id: 'theme-child',
      name: 'Brand A Light',
      group: 'Brand A',
      selectedTokenSets: {
        global: TokenSetStatus.ENABLED,
        brand: TokenSetStatus.SOURCE,
      },
      $extendsThemeId: 'theme-base-light',
      $figmaParentCollectionId: 'VariableCollectionId:base:456',
      $figmaCollectionId: 'VariableCollectionId:child:789',
      $figmaModeId: '2:0',
    };

    const result = themeObjectSchema.safeParse(fullyExtendedTheme);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.$extendsThemeId).toBe('theme-base-light');
      expect(result.data.$figmaParentCollectionId).toBe('VariableCollectionId:base:456');
      expect(result.data.$figmaCollectionId).toBe('VariableCollectionId:child:789');
    }
  });

  it('rejects a theme without required id field', () => {
    const invalidTheme = {
      name: 'Invalid Theme',
      selectedTokenSets: {
        global: TokenSetStatus.ENABLED,
      },
    };

    const result = themeObjectSchema.safeParse(invalidTheme);
    expect(result.success).toBe(false);
  });

  it('rejects a theme without required name field', () => {
    const invalidTheme = {
      id: 'theme-1',
      selectedTokenSets: {
        global: TokenSetStatus.ENABLED,
      },
    };

    const result = themeObjectSchema.safeParse(invalidTheme);
    expect(result.success).toBe(false);
  });

  it('rejects a theme without selectedTokenSets', () => {
    const invalidTheme = {
      id: 'theme-1',
      name: 'Invalid Theme',
    };

    const result = themeObjectSchema.safeParse(invalidTheme);
    expect(result.success).toBe(false);
  });

  it('rejects invalid types for extended fields', () => {
    const invalidTheme = {
      id: 'theme-1',
      name: 'Invalid Theme',
      selectedTokenSets: {
        global: TokenSetStatus.ENABLED,
      },
      $extendsThemeId: 123, // should be string
    };

    const result = themeObjectSchema.safeParse(invalidTheme);
    expect(result.success).toBe(false);
  });

  it('allows round-trip parsing with extended fields', () => {
    const originalTheme = {
      id: 'theme-roundtrip',
      name: 'Round Trip Theme',
      group: 'Test Group',
      selectedTokenSets: {
        base: TokenSetStatus.ENABLED,
        semantic: TokenSetStatus.SOURCE,
      },
      $extendsThemeId: 'parent-theme',
      $figmaParentCollectionId: 'VariableCollectionId:parent',
      $figmaCollectionId: 'VariableCollectionId:child',
      $figmaModeId: '1:0',
    };

    // Parse
    const parseResult = themeObjectSchema.safeParse(originalTheme);
    expect(parseResult.success).toBe(true);

    if (parseResult.success) {
      // Serialize and parse again
      const serialized = JSON.parse(JSON.stringify(parseResult.data));
      const reparseResult = themeObjectSchema.safeParse(serialized);
      
      expect(reparseResult.success).toBe(true);
      if (reparseResult.success) {
        expect(reparseResult.data).toEqual(originalTheme);
      }
    }
  });
});

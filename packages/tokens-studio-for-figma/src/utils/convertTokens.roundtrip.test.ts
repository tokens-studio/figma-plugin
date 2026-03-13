import { TokenFormatOptions, TokenFormat } from '@/plugin/TokenFormatStoreClass';
import convertToTokenArray from './convertTokens';
import convertTokensToObject from './convertTokensToObject';

describe('Round-trip conversion with group descriptions', () => {
  beforeEach(() => {
    TokenFormat.setFormat(TokenFormatOptions.DTCG);
  });

  it('should preserve group and root descriptions through full round-trip', () => {
    // Input JSON with group and root descriptions
    const inputJSON = {
      $description: 'Fluent Blue color palettes',
      primary: {
        $description: 'Primary brand colors',
        10: {
          $value: '#061724',
          $type: 'color',
          $description: 'Darkest primary color',
        },
        20: {
          $value: '#0a2540',
          $type: 'color',
        },
      },
      secondary: {
        $description: 'Secondary colors',
        light: {
          $value: '#f0f0f0',
          $type: 'color',
        },
        dark: {
          $value: '#333333',
          $type: 'color',
        },
      },
    };

    // Step 1: Convert JSON to token array (what happens when loading)
    const { tokens: tokenArray, metadata } = convertToTokenArray({ tokens: inputJSON });

    // Verify tokens are extracted correctly
    expect(tokenArray).toHaveLength(4);
    expect(tokenArray[0].name).toBe('primary.10');
    expect(tokenArray[0].value).toBe('#061724');
    expect(tokenArray[0].description).toBe('Darkest primary color');

    // Verify metadata is captured
    expect(metadata.root?.$description).toBe('Fluent Blue color palettes');
    expect(metadata.groups?.['primary']?.$description).toBe('Primary brand colors');
    expect(metadata.groups?.['secondary']?.$description).toBe('Secondary colors');

    // Step 2: Convert back to nested object (what happens when exporting)
    const reconstructed = convertTokensToObject(
      { base: tokenArray },
      true,
      { base: metadata },
    );

    // Verify structure is preserved
    expect(reconstructed.base.$description).toBe('Fluent Blue color palettes');
    expect(reconstructed.base.primary.$description).toBe('Primary brand colors');
    expect(reconstructed.base.primary['10'].$value).toBe('#061724');
    expect(reconstructed.base.primary['10'].$description).toBe('Darkest primary color');
    expect(reconstructed.base.primary['20'].$value).toBe('#0a2540');
    expect(reconstructed.base.secondary.$description).toBe('Secondary colors');
    expect(reconstructed.base.secondary.light.$value).toBe('#f0f0f0');
    expect(reconstructed.base.secondary.dark.$value).toBe('#333333');
  });

  it('should handle nested groups with descriptions', () => {
    const inputJSON = {
      $description: 'Root description',
      colors: {
        $description: 'All colors',
        brand: {
          $description: 'Brand colors',
          primary: {
            $description: 'Primary brand',
            base: {
              $value: '#0000ff',
              $type: 'color',
            },
          },
        },
      },
    };

    const { tokens: tokenArray, metadata } = convertToTokenArray({ tokens: inputJSON });

    expect(tokenArray).toHaveLength(1);
    expect(tokenArray[0].name).toBe('colors.brand.primary.base');

    expect(metadata.root?.$description).toBe('Root description');
    expect(metadata.groups?.['colors']?.$description).toBe('All colors');
    expect(metadata.groups?.['colors.brand']?.$description).toBe('Brand colors');
    expect(metadata.groups?.['colors.brand.primary']?.$description).toBe('Primary brand');

    // Reconstruct
    const reconstructed = convertTokensToObject(
      { base: tokenArray },
      true,
      { base: metadata },
    );

    expect(reconstructed.base.$description).toBe('Root description');
    expect(reconstructed.base.colors.$description).toBe('All colors');
    expect(reconstructed.base.colors.brand.$description).toBe('Brand colors');
    expect(reconstructed.base.colors.brand.primary.$description).toBe('Primary brand');
    expect(reconstructed.base.colors.brand.primary.base.$value).toBe('#0000ff');
  });

  it('should handle $extensions metadata', () => {
    const inputJSON = {
      $description: 'Root description',
      $extensions: {
        'com.example': {
          version: '1.0',
        },
      },
      primary: {
        $description: 'Primary colors',
        $extensions: {
          'com.example': {
            category: 'brand',
          },
        },
        base: {
          $value: '#ff0000',
          $type: 'color',
        },
      },
    };

    const { tokens: tokenArray, metadata } = convertToTokenArray({ tokens: inputJSON });

    expect(metadata.root?.$description).toBe('Root description');
    expect(metadata.root?.$extensions).toEqual({
      'com.example': {
        version: '1.0',
      },
    });
    expect(metadata.groups?.['primary']?.$extensions).toEqual({
      'com.example': {
        category: 'brand',
      },
    });

    // Reconstruct
    const reconstructed = convertTokensToObject(
      { base: tokenArray },
      true,
      { base: metadata },
    );

    expect(reconstructed.base.$description).toBe('Root description');
    expect(reconstructed.base.$extensions).toEqual({
      'com.example': {
        version: '1.0',
      },
    });
    expect(reconstructed.base.primary.$description).toBe('Primary colors');
    expect(reconstructed.base.primary.$extensions).toEqual({
      'com.example': {
        category: 'brand',
      },
    });
  });
});

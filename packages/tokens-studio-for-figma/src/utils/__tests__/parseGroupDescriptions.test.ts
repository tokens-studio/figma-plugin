import { TokenFormatOptions, setFormat } from '@/plugin/TokenFormatStoreClass';
import { convertToTokenArrayWithGroups } from '../convertTokens';
import parseTokenValues from '../parseTokenValues';

describe('Group Description Parsing', () => {
  beforeEach(() => {
    setFormat(TokenFormatOptions.DTCG);
  });

  describe('convertToTokenArrayWithGroups with group descriptions', () => {
    it('should identify and capture group descriptions in DTCG format', () => {
      const tokensWithGroupDescriptions = {
        global: {
          colors: {
            $description: 'Brand and semantic color tokens',
            brand: {
              $description: 'Primary brand colors',
              primary: {
                $type: 'color',
                $value: '#007bff',
                $description: 'Primary brand color'
              },
              secondary: {
                $type: 'color', 
                $value: '#6c757d'
              }
            },
            semantic: {
              $description: 'Semantic color system',
              success: {
                $type: 'color',
                $value: '#28a745'
              }
            }
          },
          spacing: {
            $description: 'Design system spacing scale',
            small: {
              $type: 'dimension',
              $value: '8px'
            }
          }
        }
      };

      // Convert tokens to array - this should now return both tokens and groups
      const result = convertToTokenArrayWithGroups({ tokens: tokensWithGroupDescriptions });

      // Expect the new structure with both tokens and groups
      expect(result).toEqual(
        expect.objectContaining({
          tokens: expect.arrayContaining([
            { 
              name: 'global.colors.brand.primary', 
              value: '#007bff', 
              type: 'color',
              description: 'Primary brand color'
            },
            { 
              name: 'global.colors.brand.secondary', 
              value: '#6c757d', 
              type: 'color'
            },
            { 
              name: 'global.colors.semantic.success', 
              value: '#28a745', 
              type: 'color'
            },
            { 
              name: 'global.spacing.small', 
              value: '8px', 
              type: 'dimension'
            }
          ]),
          groups: expect.arrayContaining([
            {
              path: 'global.colors',
              description: 'Brand and semantic color tokens'
            },
            {
              path: 'global.colors.brand', 
              description: 'Primary brand colors'
            },
            {
              path: 'global.colors.semantic',
              description: 'Semantic color system'
            },
            {
              path: 'global.spacing',
              description: 'Design system spacing scale'
            }
          ])
        })
      );
    });

    it('should distinguish between token descriptions and group descriptions', () => {
      const mixedDescriptions = {
        global: {
          colors: {
            $description: 'This is a GROUP description (no $value)',
            primary: {
              $type: 'color',
              $value: '#007bff',
              $description: 'This is a TOKEN description (has $value)'
            }
          }
        }
      };

      const result = convertToTokenArrayWithGroups({ tokens: mixedDescriptions });

      // Expect new structure with both tokens and groups
      expect(result).toEqual(
        expect.objectContaining({
          tokens: expect.arrayContaining([
            {
              name: 'global.colors.primary',
              value: '#007bff',
              type: 'color', 
              description: 'This is a TOKEN description (has $value)'
            }
          ]),
          groups: expect.arrayContaining([
            {
              path: 'global.colors',
              description: 'This is a GROUP description (no $value)'
            }
          ])
        })
      );
    });

    it('should handle nested group descriptions', () => {
      const nestedGroups = {
        global: {
          design: {
            $description: 'Top level design tokens',
            colors: {
              $description: 'Color system',
              brand: {
                $description: 'Brand colors only',
                primary: {
                  $type: 'color',
                  $value: '#007bff'
                }
              }
            }
          }
        }
      };

      const result = convertToTokenArrayWithGroups({ tokens: nestedGroups });

      // Expect new structure with both tokens and groups
      expect(result).toEqual(
        expect.objectContaining({
          tokens: expect.arrayContaining([
            {
              name: 'global.design.colors.brand.primary',
              value: '#007bff',
              type: 'color'
            }
          ]),
          groups: expect.arrayContaining([
            {
              path: 'global.design',
              description: 'Top level design tokens'
            },
            {
              path: 'global.design.colors',
              description: 'Color system'
            },
            {
              path: 'global.design.colors.brand',
              description: 'Brand colors only'
            }
          ])
        })
      );
    });

    it('should not break existing token parsing when no group descriptions are present', () => {
      const regularTokens = {
        global: {
          colors: {
            primary: {
              $type: 'color',
              $value: '#007bff',
              $description: 'Primary color'
            }
          }
        }
      };

      const result = convertToTokenArrayWithGroups({ tokens: regularTokens });

      // When no groups are present, should still return new structure but with empty groups
      expect(result).toEqual({
        tokens: [
          {
            name: 'global.colors.primary',
            value: '#007bff',
            type: 'color',
            description: 'Primary color'
          }
        ],
        groups: []
      });
    });
  });

  describe('parseTokenValues with group descriptions', () => {
    it('should parse token values and return groups separately', () => {
      const tokenPayload = {
        global: {
          colors: {
            $description: 'Color tokens group',
            primary: {
              $type: 'color',
              $value: '#007bff'
            }
          }
        }
      };

      // This should now return both tokens and groups
      const result = parseTokenValues(tokenPayload);

      expect(result).toEqual({
        global: expect.objectContaining({
          tokens: expect.arrayContaining([
            {
              name: 'global.colors.primary',
              value: '#007bff',
              type: 'color'
            }
          ]),
          groups: expect.arrayContaining([
            {
              path: 'global.colors',
              description: 'Color tokens group'
            }
          ])
        })
      });
    });

    it('should handle multiple token sets with groups', () => {
      const tokenPayload = {
        light: {
          colors: {
            $description: 'Light theme colors',
            primary: {
              $type: 'color',
              $value: '#007bff'
            }
          }
        },
        dark: {
          colors: {
            $description: 'Dark theme colors',
            primary: {
              $type: 'color',
              $value: '#0056b3'
            }
          }
        }
      };

      const result = parseTokenValues(tokenPayload);

      expect(result).toEqual({
        light: expect.objectContaining({
          tokens: expect.arrayContaining([
            {
              name: 'light.colors.primary',
              value: '#007bff',
              type: 'color'
            }
          ]),
          groups: expect.arrayContaining([
            {
              path: 'light.colors',
              description: 'Light theme colors'
            }
          ])
        }),
        dark: expect.objectContaining({
          tokens: expect.arrayContaining([
            {
              name: 'dark.colors.primary',
              value: '#0056b3',
              type: 'color'
            }
          ]),
          groups: expect.arrayContaining([
            {
              path: 'dark.colors',
              description: 'Dark theme colors'
            }
          ])
        })
      });
    });
  });
});
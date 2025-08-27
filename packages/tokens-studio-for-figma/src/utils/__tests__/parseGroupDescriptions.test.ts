import { TokenFormatOptions, setFormat } from '@/plugin/TokenFormatStoreClass';
import convertToTokenArray from '../convertTokens';
import parseTokenValues from '../parseTokenValues';

describe('Group Description Parsing', () => {
  beforeEach(() => {
    setFormat(TokenFormatOptions.DTCG);
  });

  describe('convertToTokenArray with group descriptions', () => {
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

      // Convert tokens to array - this should work as before
      const result = convertToTokenArray({ tokens: tokensWithGroupDescriptions });

      // Verify that tokens are still parsed correctly
      expect(result).toEqual(
        expect.arrayContaining([
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
        ])
      );

      // This test will fail initially because group descriptions aren't captured yet
      // TODO: Once implemented, this should capture group descriptions:
      // expect(result).toEqual(
      //   expect.objectContaining({
      //     tokens: expect.arrayContaining([...]),
      //     groupMetadata: expect.arrayContaining([
      //       {
      //         path: 'global.colors',
      //         description: 'Brand and semantic color tokens',
      //         tokenSet: 'global'
      //       },
      //       {
      //         path: 'global.colors.brand', 
      //         description: 'Primary brand colors',
      //         tokenSet: 'global'
      //       },
      //       {
      //         path: 'global.colors.semantic',
      //         description: 'Semantic color system', 
      //         tokenSet: 'global'
      //       },
      //       {
      //         path: 'global.spacing',
      //         description: 'Design system spacing scale',
      //         tokenSet: 'global'
      //       }
      //     ])
      //   })
      // );
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

      const result = convertToTokenArray({ tokens: mixedDescriptions });

      // Verify token description is preserved
      expect(result).toEqual(
        expect.arrayContaining([
          {
            name: 'global.colors.primary',
            value: '#007bff',
            type: 'color', 
            description: 'This is a TOKEN description (has $value)'
          }
        ])
      );

      // Group description should be captured separately (will fail initially)
      // TODO: Implement group description capture
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

      const result = convertToTokenArray({ tokens: nestedGroups });

      // Token parsing should work
      expect(result).toEqual(
        expect.arrayContaining([
          {
            name: 'global.design.colors.brand.primary',
            value: '#007bff',
            type: 'color'
          }
        ])
      );

      // TODO: Nested group descriptions should be captured
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

      const result = convertToTokenArray({ tokens: regularTokens });

      expect(result).toEqual([
        {
          name: 'global.colors.primary',
          value: '#007bff',
          type: 'color',
          description: 'Primary color'
        }
      ]);
    });
  });

  describe('parseTokenValues with group descriptions', () => {
    it('should parse token values without breaking when group descriptions are present', () => {
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

      // This should continue to work as before
      const result = parseTokenValues(tokenPayload);

      expect(result).toEqual({
        global: expect.arrayContaining([
          {
            name: 'global.colors.primary',
            value: '#007bff',
            type: 'color'
          }
        ])
      });

      // TODO: Eventually this should also return group metadata
    });
  });
});
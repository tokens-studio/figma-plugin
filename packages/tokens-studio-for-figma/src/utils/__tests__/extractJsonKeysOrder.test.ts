import { extractJsonKeysOrder } from '../extractJsonKeysOrder';

describe('extractJsonKeysOrder', () => {
  it('should extract keys in order of appearance', () => {
    const json = `{
      "color": {
        "base_palette": {
          "0000": { "value": "#000000" },
          "1000": { "value": "#ffffff" }
        }
      }
    }`;
    expect(extractJsonKeysOrder(json)).toEqual([
      'color',
      'color.base_palette',
      'color.base_palette.0000',
      'color.base_palette.0000.value',
      'color.base_palette.1000',
      'color.base_palette.1000.value',
    ]);
  });

  it('should skip comments and whitespaces', () => {
    const json = `{
      // a comment here
      "color"/* another comment */: {
        "base_palette": {
          "0000": { "value": "#000000" },
          "1000": { "value": "#ffffff" }
        }
      }
    }`;
    expect(extractJsonKeysOrder(json)).toEqual([
      'color',
      'color.base_palette',
      'color.base_palette.0000',
      'color.base_palette.0000.value',
      'color.base_palette.1000',
      'color.base_palette.1000.value',
    ]);
  });

  it('should handle arrays correctly without messing up the stack', () => {
    const json = `{
      "shadows": [
        {
          "type": "innerShadow",
          "color": "#000000"
        }
      ],
      "otherKey": "value"
    }`;
    expect(extractJsonKeysOrder(json)).toEqual([
      'shadows',
      'type',
      'color',
      'otherKey',
    ]);
  });

  it('should ignore braces and colons inside string values', () => {
    const json = `{
      "token": {
        "value": "{colors.base_palette.0000}",
        "type": "color"
      }
    }`;
    expect(extractJsonKeysOrder(json)).toEqual([
      'token',
      'token.value',
      'token.type',
    ]);
  });
});

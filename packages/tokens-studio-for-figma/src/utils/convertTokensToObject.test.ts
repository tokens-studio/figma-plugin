import convertTokensToObject from './convertTokensToObject';
import { AnyTokenList } from '@/types/tokens';
import { TokenFormatOptions, TokenFormat } from '@/plugin/TokenFormatStoreClass';

import input from './test/github/input.json';
import output from './test/github/output.json';

const INPUT_TOKENS = {
  base: [
    {
      name: 'colors.red',
      type: 'color',
      value: '#ff0000',
    },
    {
      name: 'colors.blue',
      type: 'color',
      value: '#0000ff',
    },
  ],
  extras: [
    {
      name: 'dimensions.scale',
      type: 'dimension',
      value: '2',
      description: 'We use this to scale things',
    },
    {
      name: 'dimensions.xs',
      type: 'dimension',
      value: '4',
    },
  ],
} as Record<string, AnyTokenList>;

const INPUT_TOKENS_WITH_INHERITED_TYPES = {
  base: [
    {
      name: 'colors.red',
      type: 'color',
      value: '#ff0000',
      inheritTypeLevel: 2,
    },
    {
      name: 'colors.blue',
      type: 'color',
      value: '#0000ff',
      inheritTypeLevel: 2,
    },
  ],
  extras: [
    {
      name: 'dimensions.scale',
      type: 'dimension',
      value: '2',
      description: 'We use this to scale things',
      inheritTypeLevel: 2,
    },
    {
      name: 'dimensions.xs',
      type: 'dimension',
      value: '4',
      inheritTypeLevel: 2,
    },
  ],
} as Record<string, AnyTokenList>;

const OUTPUT_LEGACY_FORMAT_OBJECT = {
  base: {
    colors: {
      red: {
        type: 'color',
        value: '#ff0000',
      },
      blue: {
        type: 'color',
        value: '#0000ff',
      },
    },
  },
  extras: {
    dimensions: {
      scale: {
        type: 'dimension',
        value: '2',
        description: 'We use this to scale things',
      },
      xs: {
        type: 'dimension',
        value: '4',
      },
    },
  },
};

const OUTPUT_LEGACY_FORMAT_OBJECT_WITH_INHERITED_TYPES = {
  base: {
    colors: {
      red: {
        value: '#ff0000',
      },
      blue: {
        value: '#0000ff',
      },
      type: 'color',
    },
  },
  extras: {
    dimensions: {
      scale: {
        value: '2',
        description: 'We use this to scale things',
      },
      xs: {
        value: '4',
      },
      type: 'dimension',
    },
  },
};

const OUTPUT_DTCG_FORMAT_OBJECT = {
  base: {
    colors: {
      red: {
        $type: 'color',
        $value: '#ff0000',
      },
      blue: {
        $type: 'color',
        $value: '#0000ff',
      },
    },
  },
  extras: {
    dimensions: {
      scale: {
        $type: 'dimension',
        $value: '2',
        $description: 'We use this to scale things',
      },
      xs: {
        $type: 'dimension',
        $value: '4',
      },
    },
  },
};

const OUTPUT_DTCG_FORMAT_OBJECT_WITH_INHERITED_TYPES = {
  base: {
    colors: {
      red: {
        $value: '#ff0000',
      },
      blue: {
        $value: '#0000ff',
      },
      $type: 'color',
    },
  },
  extras: {
    dimensions: {
      scale: {
        $value: '2',
        $description: 'We use this to scale things',
      },
      xs: {
        $value: '4',
      },
      $type: 'dimension',
    },
  },
};

describe('convertTokensToObject', () => {
  describe('when the format is set to legacy', () => {
    it('should convert array-like tokens to a nested object', () => {
      TokenFormat.setFormat(TokenFormatOptions.Legacy);
      expect(convertTokensToObject(INPUT_TOKENS, true)).toEqual(OUTPUT_LEGACY_FORMAT_OBJECT);
    });

    it('should convert array-like tokens with inherited types to a nested object', () => {
      TokenFormat.setFormat(TokenFormatOptions.Legacy);
      expect(convertTokensToObject(INPUT_TOKENS_WITH_INHERITED_TYPES, true)).toEqual(OUTPUT_LEGACY_FORMAT_OBJECT_WITH_INHERITED_TYPES);
    });
  });

  describe('when the format is set to DTCG', () => {
    it('should convert array-like tokens to a nested object', () => {
      TokenFormat.setFormat(TokenFormatOptions.DTCG);
      expect(convertTokensToObject(INPUT_TOKENS, true)).toEqual(OUTPUT_DTCG_FORMAT_OBJECT);
    });

    it('should convert array-like tokens with inherited types to a nested object', () => {
      TokenFormat.setFormat(TokenFormatOptions.DTCG);
      expect(convertTokensToObject(INPUT_TOKENS_WITH_INHERITED_TYPES, true)).toEqual(OUTPUT_DTCG_FORMAT_OBJECT_WITH_INHERITED_TYPES);
    });
  });

  it('should maintain the output values the same as the input, if there are no format changes', () => {
    TokenFormat.setFormat(TokenFormatOptions.Legacy);
    expect(convertTokensToObject(output as unknown as Record<string, AnyTokenList>, true)).toEqual(input);
  });
});

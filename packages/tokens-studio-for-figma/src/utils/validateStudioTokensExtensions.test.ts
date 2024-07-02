import { SingleToken } from '@/types/tokens';
import validateStudioTokensExtensions from './validateStudioTokensExtensions';

const tokens = {
  green: {
    value: '#00ffaa',
    type: 'color',
  },
  blue: {
    value: '#00aa',
    type: 'color',
    $extensions: {
      'studio.tokens': {},
    },
  },
  red: {
    value: '#ff0000',
    type: 'color',
    $extensions: {
      'studio.tokens': {
        modify: {},
      },
    },
  },
  valid: {
    value: '#00a2ba',
    type: 'color',
    $extensions: {
      'studio.tokens': {
        modify: {
          type: 'darken',
          value: '0.3',
          space: 'srgb',
        },
      },
    },
  },
};

const output = {
  blue: {
    value: '#00aa',
    type: 'color',
  },
  red: {
    value: '#ff0000',
    type: 'color',
  },
  valid: {
    value: '#00a2ba',
    type: 'color',
    $extensions: {
      'studio.tokens': {
        modify: {
          type: 'darken',
          value: '0.3',
          space: 'srgb',
        },
      },
    },
  },
};

describe('validateStudioTokensExtensions', () => {
  it('strips empty extension', () => {
    const validatedTokens = validateStudioTokensExtensions(tokens.blue as SingleToken);
    expect(validatedTokens).toEqual(undefined);
  });
  it('skips no extensions', () => {
    const validatedTokens = validateStudioTokensExtensions(tokens.green as SingleToken);
    expect(validatedTokens).toEqual(undefined);
  });
  it('skips undefined extension', () => {
    const validatedTokens = validateStudioTokensExtensions({ ...tokens.blue, $extensions: { 'studio.tokens': undefined } } as SingleToken);
    expect(validatedTokens).toEqual(undefined);
  });
  it('strips empty modify', () => {
    const validatedTokens = validateStudioTokensExtensions(tokens.red as SingleToken);
    expect(validatedTokens).toEqual(undefined);
  });
  it('keeps valid modify', () => {
    const validatedTokens = validateStudioTokensExtensions(tokens.valid as SingleToken);
    expect(validatedTokens).toEqual(output.valid.$extensions['studio.tokens']);
  });
});

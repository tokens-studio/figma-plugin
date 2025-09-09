import { cleanupTokenExtensions } from '../cleanupTokenExtensions';

describe('cleanupTokenExtensions', () => {
  it('removes id field from studio.tokens extension', () => {
    const token = {
      name: 'primary',
      type: 'color',
      value: '#ff0000',
      $extensions: {
        'studio.tokens': {
          id: 'abc-123-def-456',
          modify: { type: 'lighten', value: 0.1 },
        },
      },
    };

    const result = cleanupTokenExtensions(token);

    expect(result.$extensions['studio.tokens']).toEqual({
      modify: { type: 'lighten', value: 0.1 },
    });
    expect(result.$extensions['studio.tokens'].id).toBeUndefined();
  });

  it('removes empty studio.tokens extension after removing id', () => {
    const token = {
      name: 'primary',
      type: 'color',
      value: '#ff0000',
      $extensions: {
        'studio.tokens': {
          id: 'abc-123-def-456',
        },
        'other.extension': {
          someData: 'value',
        },
      },
    };

    const result = cleanupTokenExtensions(token);

    expect(result.$extensions['studio.tokens']).toBeUndefined();
    expect(result.$extensions['other.extension']).toEqual({
      someData: 'value',
    });
  });

  it('removes entire $extensions if it becomes empty', () => {
    const token = {
      name: 'primary',
      type: 'color',
      value: '#ff0000',
      $extensions: {
        'studio.tokens': {
          id: 'abc-123-def-456',
        },
      },
    };

    const result = cleanupTokenExtensions(token);

    expect(result.$extensions).toBeUndefined();
  });

  it('returns token unchanged if no studio.tokens extension exists', () => {
    const token = {
      name: 'primary',
      type: 'color',
      value: '#ff0000',
      $extensions: {
        'other.extension': {
          someData: 'value',
        },
      },
    };

    const result = cleanupTokenExtensions(token);

    expect(result).toEqual(token);
  });

  it('returns token unchanged if no $extensions exist', () => {
    const token = {
      name: 'primary',
      type: 'color',
      value: '#ff0000',
    };

    const result = cleanupTokenExtensions(token);

    expect(result).toEqual(token);
  });

  it('returns token unchanged if studio.tokens has no id field', () => {
    const token = {
      name: 'primary',
      type: 'color',
      value: '#ff0000',
      $extensions: {
        'studio.tokens': {
          modify: { type: 'lighten', value: 0.1 },
        },
      },
    };

    const result = cleanupTokenExtensions(token);

    expect(result).toEqual(token);
  });

  it('handles null and undefined tokens', () => {
    expect(cleanupTokenExtensions(null)).toBeNull();
    expect(cleanupTokenExtensions(undefined)).toBeUndefined();
    expect(cleanupTokenExtensions('string')).toBe('string');
  });

  it('does not mutate the original token', () => {
    const token = {
      name: 'primary',
      type: 'color',
      value: '#ff0000',
      $extensions: {
        'studio.tokens': {
          id: 'abc-123-def-456',
          modify: { type: 'lighten', value: 0.1 },
        },
      },
    };

    const originalToken = JSON.parse(JSON.stringify(token));
    cleanupTokenExtensions(token);

    expect(token).toEqual(originalToken);
  });
});

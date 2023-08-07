import { performCodeGen } from './performCodeGen';

describe('performCodeGen', () => {
  it('should return an array of CodegenResult objects', () => {
    const event = {
      node: {
        getSharedPluginData: jest.fn((pluginId, key) => {
          if (key === 'minWidth') {
            return 'sizing.lg';
          } if (key === 'paddingLeft') {
            return 'spacing.sm';
          }
          return undefined;
        }),
      },
    };

    const result = performCodeGen(event);

    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('language', 'CSS');
    expect(result[0]).toHaveProperty('title', 'Applied tokens (Tokens Studio)');
  });

  it('should return pseudocode for applied tokens', () => {
    const event = {
      node: {
        getSharedPluginData: jest.fn((pluginId, key) => {
          if (key === 'minWidth') {
            return 'sizing.lg';
          } if (key === 'paddingLeft') {
            return 'spacing.sm';
          }
          return undefined;
        }),
      },
    };

    const result = performCodeGen(event);

    expect(result[0]).toHaveProperty('code', 'minWidth: sizing.lg;\npaddingLeft: spacing.sm;');
  });

  it('should return a message when no tokens are found', () => {
    const event = {
      node: {
        getSharedPluginData: jest.fn(() => undefined),
      },
    };

    const result = performCodeGen(event);

    expect(result[0]).toHaveProperty('code', '/* No tokens found */');
  });
});

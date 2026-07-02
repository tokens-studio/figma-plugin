import { findDifferentState, CompareStateType } from './findDifferentState';
import { TokenTypes } from '@/constants/TokenTypes';

describe('findDifferentState', () => {
  it('returns empty object when base state and compare state are identical', () => {
    const baseState: CompareStateType = {
      tokens: {
        set1: [
          {
            name: 'token1', value: 'value1', description: '', type: TokenTypes.COLOR,
          },
          {
            name: 'token2', value: 'value2', description: '', type: TokenTypes.COLOR,
          },
        ],
        set2: [
          {
            name: 'token3', value: 'value3', description: '', type: TokenTypes.COLOR,
          },
        ],
      },
      themes: [],
      metadata: null,
    };
    const compareState = { ...baseState };

    const result = findDifferentState(baseState, compareState);

    expect(result).toEqual({
      tokens: { },
      themes: [],
      metadata: null,
    });
  });

  it('detects new tokens in compare state', () => {
    const baseState: CompareStateType = {
      tokens: {
        set1: [
          {
            name: 'token1', value: 'value1', description: '', type: TokenTypes.COLOR,
          },
        ],
      },
      themes: [],
      metadata: null,
    };
    const compareState: CompareStateType = {
      tokens: {
        set1: [
          {
            name: 'token1', value: 'value1', description: '', type: TokenTypes.COLOR,
          },
          {
            name: 'token2', value: 'value2', description: '', type: TokenTypes.COLOR,
          },
        ],
      },
      themes: [],
      metadata: null,
    };

    const result = findDifferentState(baseState, compareState);

    expect(result).toEqual({
      tokens: {
        set1: [
          {
            name: 'token2', value: 'value2', description: '', importType: 'NEW', type: TokenTypes.COLOR,
          },
        ],
      },
      themes: [],
      metadata: null,
    });
  });

  it('detects updated token value', () => {
    const baseState: CompareStateType = {
      tokens: {
        set1: [{
          name: 'token1', value: '#ff0000', description: '', type: TokenTypes.COLOR,
        }],
      },
      themes: [],
      metadata: null,
    };
    const compareState: CompareStateType = {
      tokens: {
        set1: [{
          name: 'token1', value: '#00ff00', description: '', type: TokenTypes.COLOR,
        }],
      },
      themes: [],
      metadata: null,
    };

    const result = findDifferentState(baseState, compareState);

    expect(result.tokens.set1).toEqual([
      expect.objectContaining({ name: 'token1', value: '#00ff00', oldValue: '#ff0000', importType: 'UPDATE' }),
    ]);
  });

  it('detects removed tokens', () => {
    const baseState: CompareStateType = {
      tokens: {
        set1: [
          { name: 'token1', value: 'value1', description: '', type: TokenTypes.COLOR },
          { name: 'token2', value: 'value2', description: '', type: TokenTypes.COLOR },
        ],
      },
      themes: [],
      metadata: null,
    };
    const compareState: CompareStateType = {
      tokens: {
        set1: [{ name: 'token1', value: 'value1', description: '', type: TokenTypes.COLOR }],
      },
      themes: [],
      metadata: null,
    };

    const result = findDifferentState(baseState, compareState);

    expect(result.tokens.set1).toEqual([
      expect.objectContaining({ name: 'token2', importType: 'REMOVE' }),
    ]);
  });

  it('detects opacity modifier change in $extensions as an update', () => {
    const baseState: CompareStateType = {
      tokens: {
        set1: [{
          name: 'color.primary',
          value: '#ff0000',
          description: '',
          type: TokenTypes.COLOR,
          $extensions: {
            'studio.tokens': {
              modify: { type: 'alpha', value: '0.5', space: 'srgb' },
            },
          },
        }],
      },
      themes: [],
      metadata: null,
    };
    const compareState: CompareStateType = {
      tokens: {
        set1: [{
          name: 'color.primary',
          value: '#ff0000',
          description: '',
          type: TokenTypes.COLOR,
          $extensions: {
            'studio.tokens': {
              modify: { type: 'alpha', value: '0.35', space: 'srgb' },
            },
          },
        }],
      },
      themes: [],
      metadata: null,
    };

    const result = findDifferentState(baseState, compareState);

    expect(result.tokens.set1).toHaveLength(1);
    expect(result.tokens.set1[0]).toMatchObject({ name: 'color.primary', importType: 'UPDATE' });
    expect(result.tokens.set1[0].oldValue).toBeUndefined();
  });

  it('does not flag a change when $extensions modifier is identical', () => {
    const token = {
      name: 'color.primary',
      value: '#ff0000',
      description: '',
      type: TokenTypes.COLOR,
      $extensions: {
        'studio.tokens': {
          modify: { type: 'alpha', value: '0.5', space: 'srgb' },
        },
      },
    };
    const baseState: CompareStateType = { tokens: { set1: [token] }, themes: [], metadata: null };
    const compareToken = JSON.parse(JSON.stringify(token));
    const compareState: CompareStateType = { tokens: { set1: [compareToken] }, themes: [], metadata: null };

    const result = findDifferentState(baseState, compareState);

    expect(result.tokens).toEqual({});
  });

  it('detects when opacity modifier is added to a token', () => {
    const baseState: CompareStateType = {
      tokens: {
        set1: [{ name: 'color.primary', value: '#ff0000', description: '', type: TokenTypes.COLOR }],
      },
      themes: [],
      metadata: null,
    };
    const compareState: CompareStateType = {
      tokens: {
        set1: [{
          name: 'color.primary',
          value: '#ff0000',
          description: '',
          type: TokenTypes.COLOR,
          $extensions: { 'studio.tokens': { modify: { type: 'alpha', value: '0.5', space: 'srgb' } } },
        }],
      },
      themes: [],
      metadata: null,
    };

    const result = findDifferentState(baseState, compareState);

    expect(result.tokens.set1).toHaveLength(1);
    expect(result.tokens.set1[0]).toMatchObject({ name: 'color.primary', importType: 'UPDATE' });
  });

  it('detects when opacity modifier is removed from a token', () => {
    const baseState: CompareStateType = {
      tokens: {
        set1: [{
          name: 'color.primary',
          value: '#ff0000',
          description: '',
          type: TokenTypes.COLOR,
          $extensions: { 'studio.tokens': { modify: { type: 'alpha', value: '0.5', space: 'srgb' } } },
        }],
      },
      themes: [],
      metadata: null,
    };
    const compareState: CompareStateType = {
      tokens: {
        set1: [{ name: 'color.primary', value: '#ff0000', description: '', type: TokenTypes.COLOR }],
      },
      themes: [],
      metadata: null,
    };

    const result = findDifferentState(baseState, compareState);

    expect(result.tokens.set1).toHaveLength(1);
    expect(result.tokens.set1[0]).toMatchObject({ name: 'color.primary', importType: 'UPDATE' });
  });
});

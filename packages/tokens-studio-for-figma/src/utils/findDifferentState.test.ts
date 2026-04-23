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

  it('detects when a token is marked as deprecated', () => {
    const baseState: CompareStateType = {
      tokens: {
        set1: [{ name: 'token1', value: 'value1', description: '', type: TokenTypes.COLOR }],
      },
      themes: [],
      metadata: null,
    };
    const compareState: CompareStateType = {
      tokens: {
        set1: [{ name: 'token1', value: 'value1', description: '', type: TokenTypes.COLOR, $deprecated: true }],
      },
      themes: [],
      metadata: null,
    };

    const result = findDifferentState(baseState, compareState);

    expect(result.tokens.set1).toEqual([{
      name: 'token1', value: 'value1', description: '', type: TokenTypes.COLOR, $deprecated: true, oldDeprecated: false, importType: 'UPDATE',
    }]);
  });

  it('detects when a token is un-deprecated', () => {
    const baseState: CompareStateType = {
      tokens: {
        set1: [{ name: 'token1', value: 'value1', description: '', type: TokenTypes.COLOR, $deprecated: true }],
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

    expect(result.tokens.set1).toEqual([{
      name: 'token1', value: 'value1', description: '', type: TokenTypes.COLOR, oldDeprecated: true, importType: 'UPDATE',
    }]);
  });

  it('does not report a diff when deprecated status is identical', () => {
    const baseState: CompareStateType = {
      tokens: {
        set1: [{ name: 'token1', value: 'value1', description: '', type: TokenTypes.COLOR, $deprecated: true }],
      },
      themes: [],
      metadata: null,
    };
    const compareState: CompareStateType = {
      tokens: {
        set1: [{ name: 'token1', value: 'value1', description: '', type: TokenTypes.COLOR, $deprecated: true }],
      },
      themes: [],
      metadata: null,
    };

    const result = findDifferentState(baseState, compareState);

    expect(result.tokens).toEqual({});
  });

  it('includes $deprecated on new tokens that are already deprecated', () => {
    const baseState: CompareStateType = { tokens: { set1: [] }, themes: [], metadata: null };
    const compareState: CompareStateType = {
      tokens: {
        set1: [{ name: 'token1', value: 'value1', description: '', type: TokenTypes.COLOR, $deprecated: true }],
      },
      themes: [],
      metadata: null,
    };

    const result = findDifferentState(baseState, compareState);

    expect(result.tokens.set1).toEqual([{
      name: 'token1', value: 'value1', description: '', type: TokenTypes.COLOR, $deprecated: true, importType: 'NEW',
    }]);
  });
});

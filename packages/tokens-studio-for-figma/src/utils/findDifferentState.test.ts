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
      tokens: {
        set1: [],
        set2: [],
      },
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

  // Additional test cases can be added to cover other scenarios like updated tokens, removed tokens, new/updated/removed themes, etc.
});

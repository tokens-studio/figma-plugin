import { resolvedTokensSelector } from '../resolvedTokensSelector';
import { tokenSetsWithBrokenReferencesSelector } from '../tokenSetsWithBrokenReferencesSelector';

const mockTokenState = {
  resolvedTokens: [
    {
      name: 'color.primary',
      value: '#ff0000',
      type: 'color',
    },
    {
      name: 'color.secondary',
      value: '#00ff00',
      type: 'color',
      failedToResolve: true,
    },
  ],
  tokenSetsWithBrokenReferences: ['color'],
};

const mockState = {
  tokenState: mockTokenState,
};

describe('resolvedTokensSelector', () => {
  it('should return resolved tokens from state', () => {
    const result = resolvedTokensSelector(mockState);
    expect(result).toEqual(mockTokenState.resolvedTokens);
  });
});

describe('tokenSetsWithBrokenReferencesSelector', () => {
  it('should return token sets with broken references from state', () => {
    const result = tokenSetsWithBrokenReferencesSelector(mockState);
    expect(result).toEqual(['color']);
  });
});
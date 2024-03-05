import { StorageTypeFormValues } from '@/types/StorageType';
import { localApiStateBranchSelector } from './localApiStateBranchSelector';

describe('localApiStateBranchSelector', () => {
  const localApiStates = [
    {
      branch: 'main',
      provider: 'github',
    },
    {
      branch: 'main',
      provider: 'gitlab',
    },
    {
      branch: 'main',
      provider: 'ado',
    },
    {
      provider: 'url',
    },
    {
      provider: 'jsonbin',
    },
  ];
  const expectedResult = ['main', 'main', 'main', null, null];

  it('return currentBranch', () => {
    localApiStates.forEach((localApiState, index) => {
      expect(localApiStateBranchSelector.resultFunc(localApiState as StorageTypeFormValues)).toEqual(expectedResult[index]);
    });
  });
});

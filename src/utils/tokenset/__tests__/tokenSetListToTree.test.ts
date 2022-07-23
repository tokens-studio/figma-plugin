import { tokenSetListToTree } from '../tokenSetListToTree';

describe('tokenSetListToTree', () => {
  it('returns a tree', () => {
    const input = ['global', 'theme/type', 'theme/colors/blue', 'theme/colors/red'];
    const output = [
      {
        isLeaf: true,
        path: 'global',
        key: 'global',
        parent: '',
        level: 0,
        label: 'global',
      },
      {
        isLeaf: false,
        path: 'theme',
        key: 'theme',
        parent: '',
        level: 0,
        label: 'theme',
      },
      {
        isLeaf: true,
        path: 'theme/type',
        key: 'theme/type',
        parent: 'theme',
        level: 1,
        label: 'type',
      },
      {
        isLeaf: false,
        path: 'theme/colors',
        key: 'theme/colors',
        parent: 'theme',
        level: 1,
        label: 'colors',
      },
      {
        isLeaf: true,
        path: 'theme/colors/blue',
        key: 'theme/colors/blue',
        parent: 'theme/colors',
        level: 2,
        label: 'blue',
      },
      {
        isLeaf: true,
        path: 'theme/colors/red',
        key: 'theme/colors/red',
        parent: 'theme/colors',
        level: 2,
        label: 'red',
      },
    ];
    expect(tokenSetListToTree(input)).toEqual(output);
  });
});

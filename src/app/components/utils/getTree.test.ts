import { getTree } from './getTree';

describe('getTree', () => {
  it('returns a tree', () => {
    const input = ['global', 'theme/type', 'theme/colors/blue', 'theme/colors/red'];
    const output = [
      {
        isLeaf: true,
        path: 'global',
        key: 'global/set',
        parent: '',
        level: 0,
        label: 'global',
      },
      {
        path: 'theme',
        key: 'theme/folder',
        parent: '',
        type: 'folder',
        level: 0,
        label: 'theme',
      },
      {
        path: 'theme/colors',
        key: 'theme/colors/folder',
        parent: 'theme',
        level: 1,
        label: 'colors',
      },
      {
        isLeaf: true,
        path: 'theme/colors/blue',
        key: 'theme/colors/blue/set',
        parent: 'theme/colors',
        level: 2,
        label: 'blue',
      },
      {
        isLeaf: true,
        path: 'theme/colors/red',
        key: 'theme/colors/red/set',
        parent: 'theme/colors',
        level: 2,
        label: 'red',
      },
      {
        isLeaf: true,
        path: 'theme/type',
        key: 'theme/type/set',
        parent: 'theme',
        level: 1,
        label: 'type',
      },
    ];
    expect(getTree(input)).toEqual(output);
  });
});

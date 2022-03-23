import { getTree } from './getTree';

describe('getTree', () => {
  it('returns a tree', () => {
    const input = ['global', 'theme/type', 'theme/colors/blue', 'theme/colors/red'];
    const output = [
      {
        path: 'global',
        key: 'global/set',
        parent: '',
        type: 'set',
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
        type: 'folder',
        level: 1,
        label: 'colors',
      },
      {
        path: 'theme/colors/blue',
        key: 'theme/colors/blue/set',
        parent: 'theme/colors',
        type: 'set',
        level: 2,
        label: 'blue',
      },
      {
        path: 'theme/colors/red',
        key: 'theme/colors/red/set',
        parent: 'theme/colors',
        type: 'set',
        level: 2,
        label: 'red',
      },
      {
        path: 'theme/type',
        key: 'theme/type/set',
        parent: 'theme',
        type: 'set',
        level: 1,
        label: 'type',
      },
    ];
    expect(getTree(input)).toEqual(output);
  });
});

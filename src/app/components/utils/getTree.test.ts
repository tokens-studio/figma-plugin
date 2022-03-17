import { getTree } from './getTree';

describe('getTree', () => {
  it('returns a tree', () => {
    const input = ['global', 'theme/type', 'theme/colors/blue', 'theme/colors/red', 'semantic/typography/headings/default'];
    const output = [
      {
        path: 'global',
        parent: '',
        type: 'set',
        level: 0,
        label: 'global',
      },
      {
        path: 'semantic/typography/headings',
        parent: 'semantic/typography',
        type: 'folder',
        level: 0,
        label: 'semantic/typography/headings',
      },
      {
        path: 'semantic/typography/headings/default',
        parent: 'semantic/typography/headings',
        type: 'set',
        level: 1,
        label: 'default',
      },
      {
        path: 'theme',
        parent: '',
        type: 'folder',
        level: 0,
        label: 'theme',
      },
      {
        path: 'theme/colors',
        parent: 'theme',
        type: 'folder',
        level: 1,
        label: 'colors',
      },
      {
        path: 'theme/colors/blue',
        parent: 'theme/colors',
        type: 'set',
        level: 2,
        label: 'blue',
      },
      {
        path: 'theme/colors/red',
        parent: 'theme/colors',
        type: 'set',
        level: 2,
        label: 'red',
      },
      {
        path: 'theme/type',
        parent: 'theme',
        type: 'set',
        level: 1,
        label: 'type',
      },
    ];
    expect(getTree(input)).toEqual(output);
  });
});

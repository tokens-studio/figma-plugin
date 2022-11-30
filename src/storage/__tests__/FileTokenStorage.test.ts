import { FileTokenStorage } from '../FileTokenStorage';

const json = JSON.stringify({
  global: {
    primary: {
      value: '1.5',
      type: 'sizing',
    },
    secondary: {
      value: '4',
      type: 'sizing',
    },
  },
  $themes: [
    {
      id: '8722635276827d42671ab23df835867c9e0024dd',
      name: 'Light',
      selectedTokenSets: {
        global: 'enabled',
      },
      $figmaStyleReferences: {},
    },
  ],
  $metadata: {
    tokenSetOrder: [
      'global',
    ],
  },
});
const blob = new Blob([json], { type: 'application/json' });
const mockFile = new File([blob], 'core.json');

describe('FileTokenStorage', () => {
  it('should be able to read file', async () => {
    const mockFileList = {
      0: mockFile,
      length: 1,
    } as unknown as FileList;
    const mockFileTokenStorage = new FileTokenStorage(mockFileList);

    expect(await mockFileTokenStorage.read()).toEqual([{
      data: [{
        $figmaStyleReferences: {}, id: '8722635276827d42671ab23df835867c9e0024dd', name: 'Light', selectedTokenSets: { global: 'enabled' },
      }],
      path: 'core.json',
      type: 'themes',
    },
    { data: { tokenSetOrder: ['global'] }, path: 'core.json', type: 'metadata' },
    {
      data: { primary: { type: 'sizing', value: '1.5' }, secondary: { type: 'sizing', value: '4' } }, name: 'global', path: 'core.json', type: 'tokenSet',
    }]);
  });
});

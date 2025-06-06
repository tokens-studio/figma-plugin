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
      group: 'Color',
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

// Multi-file test data
const globalTokensJson = JSON.stringify({
  primary: {
    value: '1.5',
    type: 'sizing',
  },
  secondary: {
    value: '4',
    type: 'sizing',
  },
});

const themesJson = JSON.stringify([
  {
    id: '8722635276827d42671ab23df835867c9e0024dd',
    name: 'Light',
    group: 'Color',
    selectedTokenSets: {
      global: 'enabled',
    },
    $figmaStyleReferences: {},
  },
]);

const metadataJson = JSON.stringify({
  tokenSetOrder: ['global'],
});

describe('FileTokenStorage', () => {
  it('should be able to read file', async () => {
    const mockFileList = {
      0: mockFile,
      length: 1,
    } as unknown as FileList;
    const mockFileTokenStorage = new FileTokenStorage(mockFileList);

    expect(await mockFileTokenStorage.read()).toEqual([
      {
        data: [
          {
            $figmaStyleReferences: {},
            id: '8722635276827d42671ab23df835867c9e0024dd',
            name: 'Light',
            group: 'Color',
            selectedTokenSets: { global: 'enabled' },
          },
        ],
        path: 'core.json',
        type: 'themes',
      },
      { data: { tokenSetOrder: ['global'] }, path: 'core.json', type: 'metadata' },
      {
        data: { primary: { type: 'sizing', value: '1.5' }, secondary: { type: 'sizing', value: '4' } }, name: 'global', path: 'core.json', type: 'tokenSet',
      }]);
  });

  it('should be able to read multi-file folder with enableMultiFile', async () => {
    const globalBlob = new Blob([globalTokensJson], { type: 'application/json' });
    const themesBlob = new Blob([themesJson], { type: 'application/json' });
    const metadataBlob = new Blob([metadataJson], { type: 'application/json' });

    // Create mock files with webkitRelativePath to simulate folder upload
    const globalFile = new File([globalBlob], 'global.json');
    Object.defineProperty(globalFile, 'webkitRelativePath', {
      value: 'my-tokens/global.json',
      writable: false,
    });

    const themesFile = new File([themesBlob], '$themes.json');
    Object.defineProperty(themesFile, 'webkitRelativePath', {
      value: 'my-tokens/$themes.json',
      writable: false,
    });

    const metadataFile = new File([metadataBlob], '$metadata.json');
    Object.defineProperty(metadataFile, 'webkitRelativePath', {
      value: 'my-tokens/$metadata.json',
      writable: false,
    });

    const mockFileList = {
      0: globalFile,
      1: themesFile,
      2: metadataFile,
      length: 3,
    } as unknown as FileList;

    const mockFileTokenStorage = new FileTokenStorage(mockFileList);
    mockFileTokenStorage.enableMultiFile(); // Enable multi-file support

    const result = await mockFileTokenStorage.read();

    // Files are sorted alphabetically by path: $metadata.json, $themes.json, global.json
    expect(result).toEqual([
      {
        path: 'my-tokens/$metadata.json',
        type: 'metadata',
        data: { tokenSetOrder: ['global'] },
      },
      {
        path: 'my-tokens/$themes.json',
        type: 'themes',
        data: [
          {
            $figmaStyleReferences: {},
            id: '8722635276827d42671ab23df835867c9e0024dd',
            name: 'Light',
            group: 'Color',
            selectedTokenSets: { global: 'enabled' },
          },
        ],
      },
      {
        path: 'my-tokens/global.json',
        name: 'global',
        type: 'tokenSet',
        data: {
          primary: { type: 'sizing', value: '1.5' },
          secondary: { type: 'sizing', value: '4' },
        },
      },
    ]);
  });
});

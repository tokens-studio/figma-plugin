import JSZip from 'jszip';
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

const globalTokens = JSON.stringify({
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
  tokenSetOrder: [
    'global',
  ],
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

  it('should be able to read ZIP file with multiple token files', async () => {
    const zip = new JSZip();
    zip.file('global.json', globalTokens);
    zip.file('$themes.json', themesJson);
    zip.file('$metadata.json', metadataJson);

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipFile = new File([zipBlob], 'tokens.zip');

    const mockFileList = {
      0: zipFile,
      length: 1,
    } as unknown as FileList;
    const mockFileTokenStorage = new FileTokenStorage(mockFileList);

    const result = await mockFileTokenStorage.read();

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'metadata',
          data: { tokenSetOrder: ['global'] },
        }),
        expect.objectContaining({
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
        }),
        expect.objectContaining({
          type: 'tokenSet',
          name: 'global',
          data: { primary: { type: 'sizing', value: '1.5' }, secondary: { type: 'sizing', value: '4' } },
        }),
      ]),
    );
  });
});

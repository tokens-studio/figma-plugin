import { FileTokenStorage } from '../FileTokenStorage';

const json = JSON.stringify({
  primary: {
    value: '1.5',
    type: 'sizing',
  },
  secondary: {
    value: '4',
    type: 'sizing',
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

    expect(await mockFileTokenStorage.read()).toEqual([{ data: [], path: 'core.json', type: 'themes' }, {
      data: {}, name: 'primary', path: 'core.json', type: 'tokenSet',
    }, {
      data: {}, name: 'secondary', path: 'core.json', type: 'tokenSet',
    }]);
  });
});

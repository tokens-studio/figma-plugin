import { RemoteTokenStorage, RemoteTokenStorageFile, RemoteTokenstorageErrorMessage } from '../RemoteTokenStorage';
import { TokenTypes } from '@/constants/TokenTypes';

class StubRemoteTokenStorage extends RemoteTokenStorage {
  private files: RemoteTokenStorageFile[] | RemoteTokenstorageErrorMessage;

  constructor(files: RemoteTokenStorageFile[] | RemoteTokenstorageErrorMessage) {
    super();
    this.files = files;
  }

  public async read() {
    return this.files;
  }

  public async write() {
    return true;
  }
}

describe('RemoteTokenStorage.retrieve', () => {
  // Regression: pre-#3941 the phantom `tokenSetsData` diff in useChangedState.buildMetadata
  // was tripping the optimized-sync gate on every push and dropping token files. #3941
  // normalized buildMetadata to `{tokenSetOrder}` for git providers, but retrieve() left
  // `data.metadata` undefined when no `$metadata.json` was present on remote. On the next
  // push, `isEqual(undefined, {tokenSetOrder})` is false → phantom fires again → conversion
  // commits only `$metadata.json`. Normalize `data.metadata` on retrieve so the diff's
  // baseState always has the same shape as buildMetadata's compareState.
  it('normalizes missing metadata to {tokenSetOrder} matching the retrieved tokens', async () => {
    const storage = new StubRemoteTokenStorage([
      {
        type: 'tokenSet',
        name: 'global',
        path: 'global.json',
        data: {
          primary: { name: 'primary', type: TokenTypes.COLOR, value: '#000' },
        },
      },
      {
        type: 'tokenSet',
        name: 'semantic',
        path: 'semantic.json',
        data: {
          background: { name: 'background', type: TokenTypes.COLOR, value: '#fff' },
        },
      },
      {
        type: 'themes',
        path: '$themes.json',
        data: [],
      },
      // no metadata file
    ]);

    const result = await storage.retrieve();

    expect(result).not.toBeNull();
    expect(result?.status).toBe('success');
    if (result?.status === 'success') {
      expect(result.metadata).toEqual({ tokenSetOrder: ['global', 'semantic'] });
    }
  });

  it('preserves the file contents when a $metadata.json is present', async () => {
    const storage = new StubRemoteTokenStorage([
      {
        type: 'tokenSet',
        name: 'global',
        path: 'global.json',
        data: {
          primary: { name: 'primary', type: TokenTypes.COLOR, value: '#000' },
        },
      },
      {
        type: 'metadata',
        path: '$metadata.json',
        data: { tokenSetOrder: ['global'] },
      },
    ]);

    const result = await storage.retrieve();

    if (result?.status === 'success') {
      expect(result.metadata).toEqual({ tokenSetOrder: ['global'] });
    }
  });

  it('preserves an empty metadata object rather than overwriting it', async () => {
    // Guards against the normalization mistakenly firing on `{}` — an author who wrote
    // an empty $metadata.json should get {} back, not tokenSetOrder derived from tokens.
    const storage = new StubRemoteTokenStorage([
      {
        type: 'tokenSet',
        name: 'global',
        path: 'global.json',
        data: {
          primary: { name: 'primary', type: TokenTypes.COLOR, value: '#000' },
        },
      },
      {
        type: 'metadata',
        path: '$metadata.json',
        data: {},
      },
    ]);

    const result = await storage.retrieve();

    if (result?.status === 'success') {
      expect(result.metadata).toEqual({});
    }
  });
});

import { StorageProviderType } from '@/constants/StorageProviderType';
import { StorageType } from '@/types/StorageType';
import { removeSensitiveStorageTypeFields, sanitizeStorageType } from '../sanitizeStorageType';

const asStorageType = (value: unknown) => value as StorageType;

describe('sanitizeStorageType', () => {
  it('keeps the fields needed to find a Bitbucket sync and drops the token and account email', () => {
    expect(sanitizeStorageType(asStorageType({
      provider: StorageProviderType.BITBUCKET,
      internalId: 'i',
      name: 'Tokens',
      id: 'workspace/repo',
      branch: 'main',
      filePath: 'tokens',
      baseUrl: '',
      username: 'jane@example.com',
      apiToken: 'token',
      secret: 'app-password',
    }))).toEqual({
      provider: StorageProviderType.BITBUCKET,
      internalId: 'i',
      name: 'Tokens',
      id: 'workspace/repo',
      branch: 'main',
      filePath: 'tokens',
      baseUrl: '',
    });
  });

  it('drops additionalHeaders from generic versioned storage', () => {
    expect(sanitizeStorageType(asStorageType({
      provider: StorageProviderType.GENERIC_VERSIONED_STORAGE,
      internalId: 'i',
      id: 'https://example.com',
      flow: 'Read/Write',
      additionalHeaders: [{ name: 'Authorization', value: 'Bearer x' }],
    }))).toEqual({
      provider: StorageProviderType.GENERIC_VERSIONED_STORAGE,
      internalId: 'i',
      id: 'https://example.com',
      flow: 'Read/Write',
    });
  });

  it('keeps an unknown provider instead of resetting it to local', () => {
    expect(sanitizeStorageType(asStorageType({
      provider: 'tokensstudio',
      internalId: 'i',
      name: 'Legacy',
      id: 'project',
      secret: 'pat',
    }))).toEqual({
      provider: 'tokensstudio',
      internalId: 'i',
      name: 'Legacy',
      id: 'project',
    });
  });

  it.each(['constructor', 'toString', '__proto__', 'hasOwnProperty', 'valueOf'])(
    'treats a provider named %s as unknown instead of reading Object.prototype',
    (provider) => {
      expect(sanitizeStorageType(asStorageType({
        provider, id: 'x', secret: 'y',
      }))).toEqual({ provider, id: 'x' });
    },
  );

  it('keeps falsy but defined values', () => {
    expect(sanitizeStorageType(asStorageType({
      provider: StorageProviderType.GITHUB, id: 'o/r', baseUrl: '', branch: 'main', filePath: 'tokens.json',
    }))).toEqual({
      provider: StorageProviderType.GITHUB, id: 'o/r', baseUrl: '', branch: 'main', filePath: 'tokens.json',
    });
  });

  it.each([
    ['null', null],
    ['a string', 'github'],
    ['an array', []],
    ['an object without a provider', { id: 'x', secret: 'y' }],
  ])('falls back to local for %s', (_, value) => {
    expect(sanitizeStorageType(asStorageType(value))).toEqual({ provider: StorageProviderType.LOCAL });
  });
});

describe('removeSensitiveStorageTypeFields', () => {
  it('removes known sensitive fields and keeps every other field, including ones this build does not know', () => {
    expect(removeSensitiveStorageTypeFields({
      provider: StorageProviderType.BITBUCKET,
      id: 'workspace/repo',
      someFieldFromANewerVersion: 'kept',
      username: 'jane@example.com',
      apiToken: 'token',
      secret: 'app-password',
      additionalHeaders: [],
    })).toEqual({
      cleaned: {
        provider: StorageProviderType.BITBUCKET,
        id: 'workspace/repo',
        someFieldFromANewerVersion: 'kept',
      },
      removedFields: ['username', 'apiToken', 'secret', 'additionalHeaders'],
    });
  });

  it('removes nothing from a clean storage type', () => {
    const clean = { provider: StorageProviderType.GITHUB, id: 'o/r', branch: 'main' };
    expect(removeSensitiveStorageTypeFields(clean)).toEqual({ cleaned: clean, removedFields: [] });
  });
});

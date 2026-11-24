import { StorageProviderType } from '@/constants/StorageProviderType';
import type { StorageTypeCredentials, StorageTypeFormValues } from '@/types/StorageType';
import { hasBitbucketApiToken, savesNewBitbucketApiToken } from '../bitbucketSecurityNotice';

const bitbucket = (fields: Record<string, unknown>) => ({
  provider: StorageProviderType.BITBUCKET, id: 'workspace/repo', internalId: 'b', name: 'Bitbucket', secret: '', ...fields,
}) as unknown as StorageTypeCredentials;
const github = {
  provider: StorageProviderType.GITHUB, id: 'o/r', internalId: 'g', name: 'GitHub', secret: 'pat',
} as StorageTypeCredentials;
const asForm = (credential: StorageTypeCredentials) => credential as unknown as StorageTypeFormValues<false>;

describe('hasBitbucketApiToken', () => {
  it('is true for a saved Bitbucket sync with an API token', () => {
    expect(hasBitbucketApiToken([github, bitbucket({ apiToken: 'token' })])).toBe(true);
  });

  it('is false for app passwords, blank tokens and other providers', () => {
    expect(hasBitbucketApiToken([bitbucket({ secret: 'app-password' })])).toBe(false);
    expect(hasBitbucketApiToken([bitbucket({ apiToken: '  ' })])).toBe(false);
    expect(hasBitbucketApiToken([github])).toBe(false);
    expect(hasBitbucketApiToken(undefined as unknown as StorageTypeCredentials[])).toBe(false);
  });
});

describe('savesNewBitbucketApiToken', () => {
  const saved = [bitbucket({ apiToken: 'old' })];

  it('is true for a replaced token, or the first one', () => {
    expect(savesNewBitbucketApiToken(asForm(bitbucket({ apiToken: 'new' })), saved)).toBe(true);
    expect(savesNewBitbucketApiToken(asForm(bitbucket({ apiToken: 'new' })), [])).toBe(true);
  });

  it('is false when the token is one the user already had, such as a branch or path change', () => {
    expect(savesNewBitbucketApiToken(asForm(bitbucket({ apiToken: 'old', branch: 'next' })), saved)).toBe(false);
    expect(savesNewBitbucketApiToken(asForm(bitbucket({ apiToken: ' old ' })), saved)).toBe(false);
  });

  it('is false for app passwords and other providers', () => {
    expect(savesNewBitbucketApiToken(asForm(bitbucket({ secret: 'app-password' })), saved)).toBe(false);
    expect(savesNewBitbucketApiToken(asForm(github), saved)).toBe(false);
  });
});

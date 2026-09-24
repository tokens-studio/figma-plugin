import { withDocsRef } from '../withDocsRef';
import { DocsRef } from '@/constants/DocsRef';
import { docUrls } from '@/constants/docUrls';
import { StorageProviderType } from '@/constants/StorageProviderType';

describe('withDocsRef', () => {
  it('should add the ref query parameter', () => {
    expect(withDocsRef(docUrls.root, DocsRef.FOOTER)).toBe('https://docs.tokens.studio/?ref=pf');
  });

  it('should add the ref to a page url', () => {
    expect(withDocsRef(docUrls.syncProviders[StorageProviderType.GITHUB], DocsRef.ADD_PROVIDER))
      .toBe('https://docs.tokens.studio/token-storage/remote/sync-git-github?ref=addprovider');
  });

  it('should replace an existing ref instead of adding a second one', () => {
    expect(withDocsRef('https://docs.tokens.studio/?ref=pf', DocsRef.START_SCREEN))
      .toBe('https://docs.tokens.studio/?ref=startscreen');
  });

  it('should keep the hash after the query string', () => {
    expect(withDocsRef('https://docs.tokens.studio/manage-tokens/token-types/dimension/spacing#multiple-values', DocsRef.ONBOARDING))
      .toBe('https://docs.tokens.studio/manage-tokens/token-types/dimension/spacing?ref=onboarding#multiple-values');
  });
});

import { DocsRef } from '@/constants/DocsRef';

export function withDocsRef(url: string, ref: DocsRef): string {
  const docsUrl = new URL(url);
  docsUrl.searchParams.set('ref', ref);
  return docsUrl.toString();
}

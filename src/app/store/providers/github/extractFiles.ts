import type { AnyTokenSet } from '@/types/tokens';
import type { FeatureFlagOpts } from './FeatureFlagOpts';

export const extractFiles = (filePath: string, tokenObj: Record<string, AnyTokenSet>, opts: FeatureFlagOpts) => {
  const files: { [key: string]: string } = {};
  if (filePath.endsWith('.json')) {
    files[filePath] = JSON.stringify(tokenObj, null, 2);
  } else if (opts.multiFile) {
    Object.keys(tokenObj).forEach((key) => {
      files[`${filePath}/${key}.json`] = JSON.stringify(tokenObj[key], null, 2);
    });
  }

  return files;
};

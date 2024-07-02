import { SingleToken } from '@/types/tokens';

type StudioTokensExtension = NonNullable<SingleToken['$extensions']>['studio.tokens'];

export default function validateStudioTokensExtensions(payload: SingleToken): StudioTokensExtension {
  if (typeof payload?.$extensions?.['studio.tokens'] !== 'undefined') {
    const studioTokensExtension = Object.keys(payload?.$extensions?.['studio.tokens']).reduce((accExt, k) => {
      const extension = (payload?.$extensions?.['studio.tokens'] || {})[k];
      if (extension && Object.values(extension).length > 0) {
        accExt[k] = extension;
      }

      return accExt;
    }, {});
    if (Object.keys(studioTokensExtension).length > 0) {
      return studioTokensExtension;
    }
  }

  return undefined;
}

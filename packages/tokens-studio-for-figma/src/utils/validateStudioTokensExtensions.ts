import { SingleToken } from '@/types/tokens';

type StudioTokensExtension = NonNullable<SingleToken['$extensions']>['studio.tokens'];

export default function validateStudioTokensExtensions(payload: SingleToken): StudioTokensExtension {
  let studioTokensExtension;
  if (typeof payload?.$extensions?.['studio.tokens'] !== 'undefined') {
    studioTokensExtension = Object.keys(payload?.$extensions?.['studio.tokens']).reduce((accExt, k) => {
      const extension = (payload?.$extensions?.['studio.tokens'] || {})[k];
      if (extension && Object.values(extension).length > 0) {
        accExt[k] = extension;
      }

      return accExt;
    }, {});
  }

  return studioTokensExtension;
}

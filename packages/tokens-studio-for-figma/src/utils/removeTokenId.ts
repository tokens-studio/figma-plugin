import { SingleToken } from '@/types/tokens';

export default function removeTokenId(token: SingleToken, shouldRemove: boolean): SingleToken {
  if (token.$extensions && shouldRemove && token.$extensions['studio.tokens']) {
    delete token.$extensions?.['studio.tokens']?.id;
    if (Object.keys(token.$extensions?.['studio.tokens'] || {}).length === 0) {
      delete token.$extensions?.['studio.tokens'];
    }
  }

  if (token.$extensions && shouldRemove && token.$extensions.id) {
    delete token.$extensions?.id;
  }

  if (Object.keys(token.$extensions || {}).length === 0) {
    delete token.$extensions;
  }
  return token;
}

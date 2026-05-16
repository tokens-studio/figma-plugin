import { SingleToken } from '@/types/tokens';

export default function removeTokenId(token: SingleToken, shouldRemove: boolean): SingleToken {
  if (!shouldRemove || !token.$extensions) return token;

  const newToken = { ...token, $extensions: { ...token.$extensions } };

  if (newToken.$extensions['studio.tokens']) {
    newToken.$extensions['studio.tokens'] = { ...newToken.$extensions['studio.tokens'] };
    delete (newToken.$extensions['studio.tokens'] as any).id;
    if (Object.keys(newToken.$extensions['studio.tokens']).length === 0) {
      delete newToken.$extensions['studio.tokens'];
    }
  }

  if ((newToken.$extensions as any).id) {
    delete (newToken.$extensions as any).id;
  }

  if (Object.keys(newToken.$extensions).length === 0) {
    delete (newToken as any).$extensions;
  }
  return newToken;
}

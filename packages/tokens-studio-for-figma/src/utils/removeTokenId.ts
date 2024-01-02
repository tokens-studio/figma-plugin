import omit from 'just-omit';
import { SingleToken } from '@/types/tokens';

export default function removeTokenId(token: SingleToken, shouldRemove: boolean): SingleToken {
  if (token.$extensions && shouldRemove) {
    const newToken = {
      ...token,
      $extensions: token.$extensions && token.$extensions['studio.tokens']
        ? { ...omit(token.$extensions['studio.tokens'], 'id') }
        : {},
    };
    if (Object.keys(newToken.$extensions ?? {}).length < 1) {
      return omit(newToken, '$extensions') as SingleToken;
    }
    return newToken;
  }
  return token;
}

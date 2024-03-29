import omit from 'just-omit';
import { SingleToken } from '@/types/tokens';

export default function removeTokenId(token: SingleToken, shouldRemove: boolean): SingleToken {
  if (token.$extensions && shouldRemove) {
    const newToken = {
      ...token,
      $extensions: {
        ...omit(token?.$extensions, 'id'),
      },
    };
    if (Object.keys(newToken.$extensions ?? {}).length < 1) {
      return omit(newToken, '$extensions') as SingleToken;
    }
    return newToken;
  }
  return token;
}

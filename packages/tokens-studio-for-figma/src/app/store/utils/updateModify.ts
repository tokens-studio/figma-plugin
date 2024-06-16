import { ColorModifier } from '@/types/Modifier';
import { SingleToken, TokenToRename } from '@/types/tokens';

export function updateModify(token: SingleToken, data: TokenToRename) {
  if (!token.$extensions?.['studio.tokens'] && !token.$extensions?.['studio.tokens']?.modify) return token;

  let updatedModify = token.$extensions?.['studio.tokens']?.modify;
  if (token.$extensions?.['studio.tokens'] && token.$extensions?.['studio.tokens']?.modify && token.$extensions?.['studio.tokens'].modify.value) {
    updatedModify = Object.entries(token.$extensions?.['studio.tokens'].modify).reduce<ColorModifier>((modify, [key, value]: string[]) => {
      modify = {
        ...modify,
        [key]: value.replace(data.oldName, data.newName),
      };
      return modify;
    }, {} as ColorModifier);
  }

  return {
    ...token,
    $extensions: {
      ...token.$extensions,
      'studio.tokens': {
        ...token.$extensions['studio.tokens'],
        ...(updatedModify && { modify: { ...updatedModify } }),
      },
    },
  } as SingleToken;
}

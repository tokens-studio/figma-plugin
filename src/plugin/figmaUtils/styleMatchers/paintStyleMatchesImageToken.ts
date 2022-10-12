import { SingleAssetToken } from '@/types/tokens';

export async function paintStyleMatchesImageToken(paintStyle: PaintStyle | undefined, token: Pick<SingleAssetToken, 'value' | 'description'>) {
  const imageArrayBuffer = await fetch(token.value).then((response) => response.arrayBuffer());
  const stylePaint = paintStyle?.paints[0] ?? null;
  if (stylePaint?.type === 'IMAGE') {
    if (stylePaint.imageHash) {
      const image = figma.getImageByHash(stylePaint.imageHash);
      const bytes = await image?.getBytesAsync();
      return bytes === imageArrayBuffer;
    }
  }
  return false;
}

export async function paintStyleMatchesImageToken(paintStyle: PaintStyle | undefined, imageToken: Uint8Array) {
  const stylePaint = paintStyle?.paints[0] ?? null;
  if (stylePaint?.type === 'IMAGE') {
    if (stylePaint.imageHash) {
      const image = figma.getImageByHash(stylePaint.imageHash);
      const bytes = await image?.getBytesAsync();
      return bytes === imageToken;
    }
  }
  return false;
}

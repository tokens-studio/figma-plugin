export default function setImageValuesOnTarget(
  target: BaseNode | PaintStyle,
  token: { value: Uint8Array; description: string | undefined },
) {
  try {
    if ('fills' in target && target.fills !== figma.mixed) {
      const image = figma.createImage(new Uint8Array(token.value));
      const newPaint = {
        type: 'IMAGE',
        scaleMode: 'FIT',
        imageHash: image.hash,
      } as Paint;
      target.fills = [newPaint];
    }

    if (token.description && 'description' in target) {
      target.description = token.description;
    }
  } catch (e) {
    console.error('Error setting color', e);
  }
}

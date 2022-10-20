import { SingleAssetToken } from '@/types/tokens';
import { notifyUI } from '@/plugin/notifiers';

export default async function setImageValuesOnTarget(
  target: BaseNode | PaintStyle,
  token: Pick<SingleAssetToken, 'value' | 'description'>,
) {
  try {
    const { description, value } = token;
    if ('fills' in target && target.fills !== figma.mixed) {
      const imageArrayBuffer = await fetch(value)
        .then((response) => response.arrayBuffer())
        .catch(() => {
          notifyUI('Failed to load image', { error: true });
          return null;
        });
      if (imageArrayBuffer) {
        const image = figma.createImage(new Uint8Array(imageArrayBuffer));
        const newPaint = {
          type: 'IMAGE',
          scaleMode: 'FILL',
          imageHash: image.hash,
        } as Paint;
        target.fills = [newPaint];
      }
    }

    if (description && 'description' in target) {
      target.description = description;
    }
  } catch (e) {
    console.error('Error setting image', e);
  }
}

export default function setImageValuesOnTarget(target: BaseNode | PaintStyle, newBytes: Uint8Array, key: 'paints' | 'fills' | 'strokes' = 'paints') {
  try {

    let existingPaint: Paint | null = null;
    if (key === 'fills' && 'fills' in target && target.fills !== figma.mixed) {
      existingPaint = target.fills[0] ?? null;
      const newPaint = JSON.parse(JSON.stringify(existingPaint));
      newPaint.imageHash = figma.createImage(newBytes).hash;
      target.fills = [newPaint];
    }

    // if (description && 'description' in target) {
    //   target.description = description;
    // }
  } catch (e) {
    console.error('Error setting color', e);
  }
}

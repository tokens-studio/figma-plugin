export default function setImageValuesOnTarget(
  target: BaseNode | PaintStyle,
  token: { value: Uint8Array; description: string | undefined },
  key: 'paints' | 'fills' | 'strokes' = 'paints',
) {
  try {
    if (key === 'fills' && 'fills' in target && target.fills !== figma.mixed) {
      const existingPaint = target.fills[0] ?? null;
      if (existingPaint.type === 'IMAGE') {
        const newPaint = JSON.parse(JSON.stringify(existingPaint));
        newPaint.imageHash = figma.createImage(token.value).hash;
        target.fills = [newPaint];
      }
    }

    if (token.description && 'description' in target) {
      target.description = token.description;
    }
  } catch (e) {
    console.error('Error setting color', e);
  }
}

import { getNewStyleId } from './getSiblingStyleId';
import { StyleIdMap, StyleThemeMap } from '@/types/StyleIdMap';

// Goes through all styleable properties of a node and swaps the style - this traverses the whole tree of a node
export async function applySiblingStyleId(node: BaseNode, styleIds: StyleIdMap, styleMap: StyleThemeMap, newTheme: string) {
  try {
    switch (node.type) {
      // Text layers can have stroke, effects and fill styles.
      case 'TEXT':
        {
          const newStrokeStyleId = await getNewStyleId(node.strokeStyleId as string, styleIds, styleMap, newTheme);
          const newEffectStyleId = await getNewStyleId(node.effectStyleId as string, styleIds, styleMap, newTheme);

          if (newStrokeStyleId) {
            node.strokeStyleId = newStrokeStyleId;
          }
          if (newEffectStyleId) {
            node.effectStyleId = newEffectStyleId;
          }

          // A text layer can have mixed styles, we need to swap the segments.
          if (node.fillStyleId !== figma.mixed) {
            const newFillStyleId = await getNewStyleId(node.fillStyleId as string, styleIds, styleMap, newTheme);
            if (newFillStyleId) {
              node.fillStyleId = newFillStyleId;
            }
          } else {
            node.getStyledTextSegments(['fillStyleId']).forEach(async (segment) => {
              const newFillStyleId = await getNewStyleId(segment.fillStyleId, styleIds, styleMap, newTheme);

              if (newFillStyleId) {
                node.setRangeFillStyleId(segment.start, segment.end, newFillStyleId);
              }
            });
          }
        }
        break;

      // Vector layers can have stroke, effects and fill styles.
      case 'ELLIPSE':
      case 'LINE':
      case 'POLYGON':
      case 'STAR':
      case 'RECTANGLE':
      case 'VECTOR':
      case 'COMPONENT':
      case 'INSTANCE':
      case 'FRAME':
      case 'BOOLEAN_OPERATION':
        {
          const newFillStyleId = await getNewStyleId(node.fillStyleId as string, styleIds, styleMap, newTheme);
          const newStrokeStyleId = await getNewStyleId(node.strokeStyleId as string, styleIds, styleMap, newTheme);
          const newEffectStyleId = await getNewStyleId(node.effectStyleId as string, styleIds, styleMap, newTheme);
          if (newFillStyleId) {
            node.fillStyleId = newFillStyleId;
          }
          if (newStrokeStyleId) {
            node.strokeStyleId = newStrokeStyleId;
          }
          if (newEffectStyleId) {
            node.effectStyleId = newEffectStyleId;
          }
          if (['COMPONENT', 'INSTANCE', 'FRAME', 'BOOLEAN_OPERATION'].includes(node.type) && 'children' in node) {
            await Promise.all(node.children.map((child) => applySiblingStyleId(child, styleIds, styleMap, newTheme)));
          }
        }
        break;

      case 'GROUP':
        await Promise.all(node.children.map((child) => applySiblingStyleId(child, styleIds, styleMap, newTheme)));
        break;

      default:
        break;
    }
  } catch (error) {
    console.error(error);
  }
}

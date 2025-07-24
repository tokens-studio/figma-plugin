import { getNewStyleId } from './getSiblingStyleId';
import { StyleIdMap, StyleThemeMap } from '@/types/StyleIdMap';

// Goes through all styleable properties of a node and swaps the style - this traverses the whole tree of a node
export async function applySiblingStyleId(node: BaseNode, styleIds: StyleIdMap, styleMap: StyleThemeMap, activeThemes: string[]) {
  try {
    switch (node.type) {
      // Text layers can have stroke, effects and fill styles.
      case 'TEXT':
        {
          const newStrokeStyleId = await getNewStyleId(node.strokeStyleId as string, styleIds, styleMap, activeThemes);
          const newEffectStyleId = await getNewStyleId(node.effectStyleId as string, styleIds, styleMap, activeThemes);

          if (newStrokeStyleId) {
            node.strokeStyleId = newStrokeStyleId;
          }
          if (newEffectStyleId) {
            node.effectStyleId = newEffectStyleId;
          }

          // A text layer can have mixed styles, we need to swap the segments.
          if (node.textStyleId !== figma.mixed) {
            const newTextStyleId = await getNewStyleId(node.textStyleId as string, styleIds, styleMap, activeThemes);
            if (newTextStyleId) {
              node.textStyleId = newTextStyleId;
            }
          } else {
            node.getStyledTextSegments(['textStyleId']).forEach(async (segment) => {
              const newTextStyleId = await getNewStyleId(segment.textStyleId, styleIds, styleMap, activeThemes);

              if (newTextStyleId) {
                node.setRangeTextStyleId(segment.start, segment.end, newTextStyleId);
              }
            });
          }

          if (node.fillStyleId !== figma.mixed) {
            const newFillStyleId = await getNewStyleId(node.fillStyleId as string, styleIds, styleMap, activeThemes);
            if (newFillStyleId) {
              node.fillStyleId = newFillStyleId;
            }
          } else {
            node.getStyledTextSegments(['fillStyleId']).forEach(async (segment) => {
              const newFillStyleId = await getNewStyleId(segment.fillStyleId, styleIds, styleMap, activeThemes);

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
      case 'COMPONENT_SET':
      case 'FRAME':
      case 'SECTION':
      case 'BOOLEAN_OPERATION':
        {
          const newFillStyleId = 'fillStyleId' in node && await getNewStyleId(node.fillStyleId as string, styleIds, styleMap, activeThemes);
          const newStrokeStyleId = 'strokeStyleId' in node && await getNewStyleId(node.strokeStyleId as string, styleIds, styleMap, activeThemes);
          const newEffectStyleId = 'effectStyleId' in node && await getNewStyleId(node.effectStyleId as string, styleIds, styleMap, activeThemes);
          if (newFillStyleId) {
            node.fillStyleId = newFillStyleId;
          }
          if (newStrokeStyleId) {
            node.strokeStyleId = newStrokeStyleId;
          }
          if (newEffectStyleId) {
            node.effectStyleId = newEffectStyleId;
          }
          if (['COMPONENT', 'COMPONENT_SET', 'SECTION', 'INSTANCE', 'FRAME', 'BOOLEAN_OPERATION'].includes(node.type) && 'children' in node) {
            await Promise.all(node.children.map((child) => applySiblingStyleId(child, styleIds, styleMap, activeThemes)));
          }
        }
        break;

      case 'GROUP':
        await Promise.all(node.children.map((child) => applySiblingStyleId(child, styleIds, styleMap, activeThemes)));
        break;

      default:
        break;
    }
  } catch (error) {
    console.error(error);
  }
}

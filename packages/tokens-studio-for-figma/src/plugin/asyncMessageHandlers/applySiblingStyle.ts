import { getNewStyleId } from './getSiblingStyleId';
import { StyleIdMap, StyleThemeMap } from '@/types/StyleIdMap';

// Goes through all styleable properties of a node and swaps the style - this traverses the whole tree of a node
export async function applySiblingStyleId(node: BaseNode, styleIds: StyleIdMap, styleMap: StyleThemeMap, activeThemes: string[]) {
  try {
    // Helper function to check if a style ID is relevant for swapping
    const hasRelevantStyleId = (styleId: string): boolean => {
      if (!styleId || styleId === figma.mixed || !styleId.trim()) return false;
      const normalizedStyleId = styleId.split(',')[0].concat(',');
      return styleIds.hasOwnProperty(normalizedStyleId);
    };

    // Helper function to check if a node has any relevant styles
    const nodeHasRelevantStyles = (currentNode: BaseNode): boolean => {
      switch (currentNode.type) {
        case 'TEXT':
          return (
            hasRelevantStyleId(currentNode.textStyleId as string)
            || hasRelevantStyleId(currentNode.fillStyleId as string)
            || hasRelevantStyleId(currentNode.strokeStyleId as string)
            || hasRelevantStyleId(currentNode.effectStyleId as string)
          );
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
          return (
            ('fillStyleId' in currentNode && hasRelevantStyleId(currentNode.fillStyleId as string))
            || ('strokeStyleId' in currentNode && hasRelevantStyleId(currentNode.strokeStyleId as string))
            || ('effectStyleId' in currentNode && hasRelevantStyleId(currentNode.effectStyleId as string))
          );
        default:
          return false;
      }
    };

    switch (node.type) {
      // Text layers can have stroke, effects and fill styles.
      case 'TEXT': {
        const strokeStyleId = node.strokeStyleId as string;
        const effectStyleId = node.effectStyleId as string;
        const textStyleId = node.textStyleId as string;
        const fillStyleId = node.fillStyleId as string;

        if (hasRelevantStyleId(strokeStyleId)) {
          const newStrokeStyleId = await getNewStyleId(strokeStyleId, styleIds, styleMap, activeThemes);
          if (newStrokeStyleId) {
            node.strokeStyleId = newStrokeStyleId;
          }
        }

        if (hasRelevantStyleId(effectStyleId)) {
          const newEffectStyleId = await getNewStyleId(effectStyleId, styleIds, styleMap, activeThemes);
          if (newEffectStyleId) {
            node.effectStyleId = newEffectStyleId;
          }
        }

        // A text layer can have mixed styles, we need to swap the segments.
        if (node.textStyleId !== figma.mixed) {
          if (hasRelevantStyleId(textStyleId)) {
            const newTextStyleId = await getNewStyleId(textStyleId, styleIds, styleMap, activeThemes);
            if (newTextStyleId) {
              node.textStyleId = newTextStyleId;
            }
          }
        } else {
          node.getStyledTextSegments(['textStyleId']).forEach(async (segment) => {
            if (hasRelevantStyleId(segment.textStyleId)) {
              const newTextStyleId = await getNewStyleId(segment.textStyleId, styleIds, styleMap, activeThemes);
              if (newTextStyleId) {
                node.setRangeTextStyleId(segment.start, segment.end, newTextStyleId);
              }
            }
          });
        }

        if (node.fillStyleId !== figma.mixed) {
          if (hasRelevantStyleId(fillStyleId)) {
            const newFillStyleId = await getNewStyleId(fillStyleId, styleIds, styleMap, activeThemes);
            if (newFillStyleId) {
              node.fillStyleId = newFillStyleId;
            }
          }
        } else {
          node.getStyledTextSegments(['fillStyleId']).forEach(async (segment) => {
            if (hasRelevantStyleId(segment.fillStyleId)) {
              const newFillStyleId = await getNewStyleId(segment.fillStyleId, styleIds, styleMap, activeThemes);
              if (newFillStyleId) {
                node.setRangeFillStyleId(segment.start, segment.end, newFillStyleId);
              }
            }
          });
        }
        break;
      }

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
      case 'BOOLEAN_OPERATION': {
        const fillStyleId = 'fillStyleId' in node ? node.fillStyleId as string : '';
        const strokeStyleId = 'strokeStyleId' in node ? node.strokeStyleId as string : '';
        const effectStyleId = 'effectStyleId' in node ? node.effectStyleId as string : '';

        if ('fillStyleId' in node && hasRelevantStyleId(fillStyleId)) {
          const newFillStyleId = await getNewStyleId(fillStyleId, styleIds, styleMap, activeThemes);
          if (newFillStyleId) {
            node.fillStyleId = newFillStyleId;
          }
        }
        if ('strokeStyleId' in node && hasRelevantStyleId(strokeStyleId)) {
          const newStrokeStyleId = await getNewStyleId(strokeStyleId, styleIds, styleMap, activeThemes);
          if (newStrokeStyleId) {
            node.strokeStyleId = newStrokeStyleId;
          }
        }
        if ('effectStyleId' in node && hasRelevantStyleId(effectStyleId)) {
          const newEffectStyleId = await getNewStyleId(effectStyleId, styleIds, styleMap, activeThemes);
          if (newEffectStyleId) {
            node.effectStyleId = newEffectStyleId;
          }
        }

        if (['COMPONENT', 'COMPONENT_SET', 'SECTION', 'INSTANCE', 'FRAME', 'BOOLEAN_OPERATION'].includes(node.type) && 'children' in node) {
          // Performance optimization: only recurse into children if this subtree might contain relevant styles
          // Check if any child or descendant might have relevant styles before recursing
          const shouldProcessChildren = node.children.some((child) => (
            // For deeply nested structures, we can limit the depth of pre-scanning
            // by only checking immediate children, but still processing all if any are found
            nodeHasRelevantStyles(child) || ('children' in child && child.children.length > 0)
          ));

          if (shouldProcessChildren) {
            await Promise.all(node.children.map((child) => applySiblingStyleId(child, styleIds, styleMap, activeThemes)));
          }
        }
        break;
      }

      case 'GROUP': {
        // For groups, we need to check children as groups themselves don't have styles
        const hasStyledChildren = node.children.some((child) => (
          nodeHasRelevantStyles(child) || ('children' in child && child.children.length > 0)
        ));

        if (hasStyledChildren) {
          await Promise.all(node.children.map((child) => applySiblingStyleId(child, styleIds, styleMap, activeThemes)));
        }
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error(error);
  }
}

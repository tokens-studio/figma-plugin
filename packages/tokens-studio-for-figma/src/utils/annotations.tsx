/* eslint "no-multi-assign": 0 */
import { Direction } from '@/constants/Direction';
import { StyleIdBackupKeys } from '@/constants/StyleIdBackupKeys';
import { notifyUI } from '@/plugin/notifiers';
import { SelectionValue } from '@/types';

const DIST = 80;
const BASE_SIZE = 12;
const FONT_CODE = { family: 'Roboto Mono', style: 'Regular' };
const FONT_TITLE = { family: 'Roboto Mono', style: 'Bold' };
const BG_COLOR = { r: 0.1, g: 0.1, b: 0.1 };
const STROKE_COLOR = { r: 0.482, g: 0.38, b: 1 };
const TITLE_COLOR = { r: 1, g: 1, b: 1 };
const PROP_COLOR = { r: 0.9, g: 0.9, b: 0.9 };
const VALUE_COLOR = { r: 1, g: 0.839, b: 0.078 };

function getParentSelection(sel: SceneNode, distance: number, direction: Direction, position = { x: 0, y: 0, width: 0 }): {
  distance: number;
  position: { x: number; y: number; width: number; }
} {
  if (position.width === 0) position.width = sel.width - DIST; // save original width

  if ('parent' in sel && sel.parent) {
    if (sel.parent.type !== 'DOCUMENT') {
      if (sel.parent.type !== 'PAGE') {
        switch (direction) {
          case Direction.TOP:
          case Direction.BOTTOM:
            distance += sel.y;
            break;
          case Direction.RIGHT:
            distance = sel.parent.width - sel.x - position.x - position.width;
            break;
          default:
            distance += sel.x;
            break;
        }
      }
      position.x += sel.x;
      position.y += sel.y;
      return sel.parent.type !== 'PAGE'
        ? getParentSelection(sel.parent, distance, direction, position)
        : { distance, position };
    }
  }

  return {
    distance,
    position,
  };
}

function calcPosition(selection: SceneNode, anno: FrameNode, direction: Direction) {
  let x = 0;
  let y = 0;

  // Loop through the parent nodes to get a correct X & Y position
  const { distance, position } = getParentSelection(selection, DIST, direction);

  switch (direction) {
    case Direction.TOP:
      x = position.x + selection.width / 2 - anno.width / 2;
      y = position.y - Math.abs(distance) - anno.height;
      break;
    case Direction.RIGHT:
      x = position.x + selection.width + Math.abs(distance);
      y = position.y + selection.height / 2 - anno.height / 2;
      break;
    case Direction.BOTTOM:
      x = position.x + selection.width / 2 - anno.width / 2;
      y = position.y + selection.height + Math.abs(distance);
      break;
    default:
      // left
      x = position.x - Math.abs(distance) - anno.width;
      y = position.y + selection.height / 2 - anno.height / 2;
      break;
  }

  return { x, y, distance };
}

function createProperties(
  anno: FrameNode,
  tokens: SelectionValue & { annoTitle: string },
) {
  Object.entries(tokens)
    .filter(([key]) => !StyleIdBackupKeys.includes(key))
    .forEach(([key, value]) => {
      const prop = figma.createFrame();
      prop.layoutMode = 'HORIZONTAL';
      prop.counterAxisAlignItems = 'CENTER';
      prop.itemSpacing = BASE_SIZE / 2;
      prop.fills = [{ visible: false, type: 'SOLID', color: BG_COLOR }];
      prop.primaryAxisSizingMode = 'AUTO';
      prop.counterAxisSizingMode = 'AUTO';

      const propText = figma.createText();
      const propValue = figma.createText();
      propText.fontName = propValue.fontName = FONT_CODE;
      propText.fontSize = propValue.fontSize = BASE_SIZE;
      propValue.fills = [{ type: 'SOLID', color: VALUE_COLOR }];

      if (key === 'annoTitle') {
        prop.name = 'annotation-title';
        propText.fontName = FONT_TITLE;
        propText.characters = value as string;
        propText.fills = [{ type: 'SOLID', color: TITLE_COLOR }];
        prop.appendChild(propText);
      } else {
        prop.name = 'annotation-prop';
        propText.characters = `${key}:`;
        propText.fills = [{ type: 'SOLID', color: PROP_COLOR }];
        propValue.characters = value as string;
        prop.appendChild(propText);
        prop.appendChild(propValue);
      }

      anno.appendChild(prop);
    });
}

function createAnno(tokens: SelectionValue, direction: Direction) {
  const selection = figma.currentPage.selection[0];

  /* Create the alignment container */
  const cont = figma.createFrame();
  cont.layoutMode = ['top', 'bottom'].includes(direction) ? 'VERTICAL' : 'HORIZONTAL';
  cont.fills = [];
  cont.clipsContent = false;
  cont.primaryAxisSizingMode = cont.counterAxisSizingMode = 'AUTO';
  cont.primaryAxisAlignItems = cont.counterAxisAlignItems = 'CENTER';

  /* Create the annotation card */
  const anno = figma.createFrame();
  anno.layoutMode = 'VERTICAL';
  anno.paddingTop = anno.paddingLeft = anno.paddingBottom = anno.paddingRight = BASE_SIZE;
  anno.itemSpacing = BASE_SIZE / 2;
  anno.fills = [{ type: 'SOLID', color: BG_COLOR }];
  anno.strokes = [{ type: 'SOLID', color: STROKE_COLOR }];
  anno.strokeWeight = 1;
  anno.cornerRadius = BASE_SIZE / 2;
  anno.primaryAxisSizingMode = anno.counterAxisSizingMode = 'AUTO';
  anno.name = 'annotation-card';

  /* Add the tokens */
  createProperties(anno, { annoTitle: selection.name, ...tokens });

  /* Position the container */
  const position = calcPosition(selection, anno, direction);
  cont.x = position.x;
  cont.y = position.y;

  /* Rename the annotation based on selection */
  cont.name = `__[annotation]_${selection.name}`;

  /* Add the arrow */
  const arrowAnchor = figma.createFrame();
  arrowAnchor.resize(0.01, 0.01);
  arrowAnchor.fills = [];
  arrowAnchor.clipsContent = false;
  arrowAnchor.name = 'arrow-anchor';

  const arrow = figma.createVector();
  arrow.vectorPaths = [
    {
      windingRule: 'NONE',
      data: `M 0 0 L ${position.distance} 0`,
    },
  ];
  arrow.strokes = [{ type: 'SOLID', color: STROKE_COLOR }];
  arrow.strokeWeight = 2;
  arrow.strokeCap = 'ARROW_EQUILATERAL';
  switch (direction) {
    case 'top':
      arrow.rotation = -90;
      break;
    case 'right':
      arrow.rotation = 180;
      break;
    case 'bottom':
      arrow.rotation = 90;
      break;
    default:
      break;
  }
  /* make a copy of the original node */
  const arrowCopy = JSON.parse(JSON.stringify(arrow.vectorNetwork));

  /* if it has a strokeCap property, change */
  if ('strokeCap' in arrowCopy.vertices[arrowCopy.vertices.length - 1]) {
    arrowCopy.vertices[arrowCopy.vertices.length - 1].strokeCap = 'ARROW_EQUILATERAL';
    arrowCopy.vertices[0].strokeCap = 'ROUND';
  }
  arrow.vectorNetwork = arrowCopy;
  arrowAnchor.appendChild(arrow);

  // Add the child frames
  if (['top', 'left'].includes(direction)) {
    cont.appendChild(anno);
    cont.appendChild(arrowAnchor);
  } else {
    cont.appendChild(arrowAnchor);
    cont.appendChild(anno);
  }

  /* Add it to the page */
  figma.currentPage.appendChild(cont);
}

export async function createAnnotation(tokens: SelectionValue, direction: Direction) {
  const loadFonts = async () => {
    await figma.loadFontAsync(FONT_CODE);
    await figma.loadFontAsync(FONT_TITLE);
  };

  try {
    loadFonts().then(() => createAnno(tokens, direction));
  } catch (err) {
    console.log(err);
    notifyUI('There was an issue creating the annotation. Please try again.');
  }
}

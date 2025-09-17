import { TokenTypes } from '@tokens-studio/types';
import { createSetHeadingTexts } from './textUtils';

const defaultColor = { r: 1, g: 0.184, b: 0.973 }; // #FF2FF8
const defaultStrokeColor = { r: 0.95, g: 0.95, b: 0.95 }; // #F2F2F2
const subduedFillColor = { r: 0.996, g: 0.933, b: 0.998 }; // #FFEDFE

export async function createTokenTemplate(tokenType: TokenTypes): Promise<FrameNode> {
  // Load default font first
  await figma.loadFontAsync({ family: 'Geist Mono', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Geist Mono', style: 'Medium' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });

  const frame = figma.createFrame();
  frame.name = `Token Template - ${tokenType}`;
  frame.layoutMode = 'HORIZONTAL';
  frame.itemSpacing = 16;
  frame.layoutSizingHorizontal = 'HUG';
  frame.layoutSizingVertical = 'HUG';
  frame.paddingLeft = 0;
  frame.paddingRight = 0;
  frame.paddingTop = 8;
  frame.paddingBottom = 8;
  frame.cornerRadius = 0;
  frame.clipsContent = false;
  frame.fills = [];

  // Create token name text
  const tokenNameText = figma.createText();
  tokenNameText.name = '__tokenName';
  tokenNameText.fontName = { family: 'Geist Mono', style: 'Medium' };
  tokenNameText.fontSize = 12;
  tokenNameText.characters = 'Token Name';
  tokenNameText.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }]; // Black text
  frame.appendChild(tokenNameText);
  tokenNameText.resize(200, tokenNameText.height);

  // Create token value text
  const tokenValueText = figma.createText();
  tokenValueText.name = '__tokenValue';
  tokenValueText.fontName = { family: 'Geist Mono', style: 'Regular' };
  tokenValueText.fontSize = 12;
  tokenValueText.characters = 'Token Value';
  tokenValueText.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }]; // Black text
  frame.appendChild(tokenValueText);
  tokenValueText.resize(300, tokenValueText.height);

  // Create token resolved value text
  const tokenResolvedValueText = figma.createText();
  tokenResolvedValueText.name = '__value';
  tokenResolvedValueText.fontName = { family: 'Geist Mono', style: 'Regular' };
  tokenResolvedValueText.fontSize = 12;
  tokenResolvedValueText.characters = 'Token Resolved Value';
  tokenResolvedValueText.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }]; // Black text
  frame.appendChild(tokenResolvedValueText);
  tokenResolvedValueText.resize(300, tokenResolvedValueText.height);

  // Create visual representation based on token type
  switch (tokenType) {
    case TokenTypes.TYPOGRAPHY: {
      const textNode = figma.createText();
      textNode.name = '__typography';
      textNode.fontName = { family: 'Inter', style: 'Regular' };
      textNode.fontSize = 16; // Default size for preview
      textNode.characters = 'Aa';
      textNode.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
      frame.appendChild(textNode);
      break;
    }

    case TokenTypes.FONT_SIZES: {
      // For font sizes, use "Aa" characters with the actual font size
      const textNode = figma.createText();
      textNode.name = '__fontSizes';
      textNode.fontName = { family: 'Inter', style: 'Regular' };
      textNode.fontSize = 16; // Default size for preview
      textNode.characters = 'Aa';
      textNode.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
      frame.appendChild(textNode);
      break;
    }

    case TokenTypes.DIMENSION:
    case TokenTypes.PARAGRAPH_INDENT:
    case TokenTypes.LINE_HEIGHTS:
    case TokenTypes.LETTER_SPACING:
    case TokenTypes.SPACING:
    case TokenTypes.SIZING: {
      // Create a horizontal auto layout frame
      const sizingFrame = figma.createFrame();
      sizingFrame.layoutMode = 'HORIZONTAL';
      sizingFrame.primaryAxisSizingMode = 'AUTO';
      sizingFrame.counterAxisSizingMode = 'AUTO';
      sizingFrame.primaryAxisAlignItems = 'CENTER';
      sizingFrame.counterAxisAlignItems = 'CENTER';
      sizingFrame.itemSpacing = 0;
      sizingFrame.paddingLeft = 0;
      sizingFrame.paddingRight = 0;
      sizingFrame.paddingTop = 0;
      sizingFrame.paddingBottom = 0;
      sizingFrame.fills = [];
      sizingFrame.clipsContent = false;

      // First vertical line (16px height, 2px width)
      const leftLine = figma.createRectangle();
      leftLine.resize(1, 16);
      leftLine.fills = [{ type: 'SOLID', color: defaultColor }];
      leftLine.strokes = [];
      leftLine.name = 'sizing-left-line';

      // Rectangle (2px height, 100px width)
      const rect = figma.createRectangle();
      rect.name = '__width';
      rect.resize(100, 16);
      rect.fills = [{ type: 'SOLID', color: subduedFillColor }];
      rect.strokes = [];

      // Second vertical line (16px height, 2px width)
      const rightLine = figma.createRectangle();
      rightLine.resize(1, 16);
      rightLine.fills = [{ type: 'SOLID', color: defaultColor }];
      rightLine.strokes = [];
      rightLine.name = 'sizing-right-line';

      // Add all to the sizingFrame
      sizingFrame.appendChild(leftLine);
      sizingFrame.appendChild(rect);
      sizingFrame.appendChild(rightLine);

      frame.appendChild(sizingFrame);
      break;
    }

    case TokenTypes.BORDER_RADIUS: {
      const rect = figma.createRectangle();
      rect.name = '__borderRadiusTopLeft';
      rect.resize(16, 16);
      rect.fills = [{ type: 'SOLID', color: subduedFillColor }];
      rect.strokes = [{ type: 'SOLID', color: defaultColor }];
      rect.strokeLeftWeight = 1;
      rect.strokeTopWeight = 1;
      rect.strokeRightWeight = 0;
      rect.strokeBottomWeight = 0;
      frame.appendChild(rect);
      break;
    }

    case TokenTypes.OPACITY: {
      const rect = figma.createRectangle();
      rect.name = '__opacity';
      rect.resize(16, 16);
      rect.cornerRadius = 3;
      rect.fills = [{ type: 'SOLID', color: defaultColor }];
      frame.appendChild(rect);
      break;
    }

    case TokenTypes.BORDER: {
      const rect = figma.createRectangle();
      rect.name = '__border';
      rect.resize(16, 16);
      rect.fills = [{ type: 'SOLID', color: subduedFillColor }];
      frame.appendChild(rect);
      break;
    }

    case TokenTypes.BOX_SHADOW: {
      const rect = figma.createRectangle();
      rect.name = '__boxShadow';
      rect.resize(16, 16);
      rect.cornerRadius = 3;
      rect.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
      frame.appendChild(rect);
      break;
    }

    case TokenTypes.COLOR: {
      const rect = figma.createRectangle();
      rect.name = '__fill';
      rect.resize(16, 16);
      rect.cornerRadius = 999;
      rect.fills = [{ type: 'SOLID', color: defaultColor }];
      rect.strokes = [{ type: 'SOLID', color: defaultStrokeColor }];
      rect.strokeWeight = 1;
      frame.appendChild(rect);
      break;
    }

    default: {
      break;
    }
  }

  return frame;
}

export async function createSetHeading(setName: string, tokenCount: number): Promise<FrameNode> {
  const headingContainer = figma.createFrame();
  headingContainer.name = `${setName} Heading`;
  headingContainer.layoutMode = 'VERTICAL';
  headingContainer.itemSpacing = 8;
  headingContainer.primaryAxisSizingMode = 'AUTO';
  headingContainer.counterAxisSizingMode = 'AUTO';
  headingContainer.fills = [];
  headingContainer.clipsContent = false;

  // Create heading texts
  const { setNameText, tokenCountText } = await createSetHeadingTexts(setName, tokenCount);

  headingContainer.appendChild(setNameText);
  headingContainer.appendChild(tokenCountText);

  return headingContainer;
}

export async function createMainContainer(): Promise<FrameNode> {
  const container = figma.createFrame();
  container.name = 'Living Documentation';
  container.layoutMode = 'VERTICAL';
  container.itemSpacing = 32;
  container.layoutSizingHorizontal = 'HUG';
  container.layoutSizingVertical = 'HUG';
  container.paddingLeft = 32;
  container.paddingRight = 32;
  container.paddingTop = 32;
  container.paddingBottom = 32;
  container.clipsContent = false;

  return container;
}

export function createSetContainer(setName: string): FrameNode {
  const setContainer = figma.createFrame();
  setContainer.name = `${setName} Tokens`;
  setContainer.layoutMode = 'VERTICAL';
  setContainer.itemSpacing = 8;
  setContainer.layoutSizingHorizontal = 'HUG';
  setContainer.layoutSizingVertical = 'HUG';
  setContainer.fills = [];
  setContainer.clipsContent = false;

  return setContainer;
}

export function createCombinedSetContainer(setName: string): FrameNode {
  const combinedContainer = figma.createFrame();
  combinedContainer.name = `${setName} Set`;
  combinedContainer.layoutMode = 'VERTICAL';
  combinedContainer.itemSpacing = 16;
  combinedContainer.layoutSizingHorizontal = 'HUG';
  combinedContainer.layoutSizingVertical = 'HUG';
  combinedContainer.fills = [];
  combinedContainer.clipsContent = false;

  return combinedContainer;
}

export function applyTemplateLayoutProperties(template: any): void {
  if (template && 'layoutSizingHorizontal' in template) {
    // Set horizontal sizing to fill container width, but keep vertical as hug
    template.layoutSizingHorizontal = 'FILL';
    template.layoutSizingVertical = 'HUG';
    // Ensure no clipping for shadows
    template.clipsContent = false;
  }
}

export async function createColumnHeaders(): Promise<FrameNode> {
  // Load Inter font for headers
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });

  const headerContainer = figma.createFrame();
  headerContainer.name = 'Column Headers';
  headerContainer.layoutMode = 'HORIZONTAL';
  headerContainer.itemSpacing = 16;
  headerContainer.layoutSizingHorizontal = 'HUG';
  headerContainer.layoutSizingVertical = 'HUG';
  headerContainer.paddingLeft = 0;
  headerContainer.paddingRight = 0;
  headerContainer.paddingTop = 0;
  headerContainer.paddingBottom = 16;
  headerContainer.fills = [];
  headerContainer.clipsContent = false;

  // Create header texts for each column
  const headers = [
    { name: 'Token Name', width: 200 },
    { name: 'Token Value', width: 300 },
    { name: 'Resolved Value', width: 300 },
    { name: 'Visual Preview', width: 100 },
  ];

  for (const header of headers) {
    const headerText = figma.createText();
    headerText.name = `Header - ${header.name}`;
    headerText.fontName = { family: 'Inter', style: 'Regular' };
    headerText.fontSize = 11;
    headerText.characters = header.name;
    headerText.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.4 } }]; // Muted color
    headerText.resize(header.width, headerText.height);
    headerContainer.appendChild(headerText);
  }

  return headerContainer;
}

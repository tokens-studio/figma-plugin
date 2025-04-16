import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import type { AnyTokenList } from '@/types/AsyncMessages';

/**
 * Plugin handler: generate a style guide page/frame in the Figma document for color tokens.
 */
export const generateStyleGuide: AsyncMessageChannelHandlers[AsyncMessageTypes.GENERATE_STYLE_GUIDE] = async (msg) => {
  // Create (or clear) a dedicated page
  const page = figma.createPage();
  page.name = msg.pageName || 'Style Guide';
  figma.currentPage = page;

  // Create a frame for color swatches
  const frame = figma.createFrame();
  frame.name = 'Colors';
  frame.layoutMode = 'GRID';
  frame.primaryAxisSizingMode = 'AUTO';
  frame.counterAxisSizingMode = 'AUTO';
  frame.itemSpacing = 16;
  frame.paddingTop = frame.paddingBottom = frame.paddingLeft = frame.paddingRight = 32;
  page.appendChild(frame);

  // Ensure text font is loaded for labels
  await figma.loadFontAsync({ family: 'Roboto', style: 'Regular' });

  // Gather local paint styles once
  const paintStyles = figma.getLocalPaintStyles();

  // Iterate color tokens and place swatches + labels
  for (const token of msg.tokens) {
    if ((token as any).type === 'color') {
      const style = paintStyles.find(s => s.name === (token as any).name);
      if (!style) continue;

      // Swatch rectangle
      const rect = figma.createRectangle();
      rect.resize(100, 100);
      rect.fills = [];
      rect.fillStyleId = style.id;
      rect.name = (token as any).name;
      frame.appendChild(rect);

      // Label text
      const text = figma.createText();
      text.characters = (token as any).name;
      text.fontSize = 12;
      text.textAlignHorizontal = 'CENTER';
      text.textAlignVertical = 'CENTER';
      text.resize(100, text.height);
      frame.appendChild(text);
    }
  }

  // No return payload needed
  return {};
};
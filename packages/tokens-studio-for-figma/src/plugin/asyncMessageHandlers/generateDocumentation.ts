import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes, DocumentationConfig } from '@/types/AsyncMessages';
import { AnyTokenList, SingleToken } from '@/types/tokens';
import { TokenTypes } from '@/constants/TokenTypes';
import { notifyUI } from '../notifiers';
import { NodeManager } from '../NodeManager';
import { SharedDataHandler } from '../SharedDataHandler';

const CARD_SPACING = 40; // Space between cards
const GRID_COLUMNS = 4; // Number of columns in grid layout
const CARD_WIDTH = 240; // Width of a single card
const CARD_HEADER_HEIGHT = 40; // Height of the card header
const CARD_PADDING = 16; // Padding inside cards
const BASE_FONT_SIZE = 12; // Base font size
const COLOR_SWATCH_SIZE = 32; // Size of color swatches

// Colors used in the documentation
const BG_COLOR = { r: 0.1, g: 0.1, b: 0.1 };
const HEADER_BG_COLOR = { r: 0.15, g: 0.15, b: 0.15 };
const STROKE_COLOR = { r: 0.2, g: 0.2, b: 0.2 };
const TEXT_COLOR = { r: 1, g: 1, b: 1 };
const TYPE_COLOR = { r: 0.6, g: 0.6, b: 0.6 };
const VALUE_COLOR = { r: 1, g: 0.839, b: 0.078 };

// Fonts used in the documentation
const FONT_REGULAR = { family: 'Inter', style: 'Regular' };
const FONT_MEDIUM = { family: 'Inter', style: 'Medium' };
const FONT_BOLD = { family: 'Inter', style: 'Bold' };

/**
 * Asynchronously creates a documentation page from tokens
 * @param config Documentation configuration
 * @returns Promise resolving to object with success status
 */
async function createDocumentation(config: DocumentationConfig): Promise<{ success: boolean; message?: string }> {
  try {
    // Load required fonts
    await Promise.all([
      figma.loadFontAsync(FONT_REGULAR),
      figma.loadFontAsync(FONT_MEDIUM),
      figma.loadFontAsync(FONT_BOLD)
    ]);

    // Get tokens from shared data
    const tokenData = await getTokens();

    // Filter tokens based on token sets and types from config
    const filteredTokens = filterTokens(tokenData, config);
    
    if (Object.keys(filteredTokens).length === 0) {
      return { success: false, message: 'No tokens found for the selected sets and types.' };
    }

    // Create the documentation frame
    const documentation = createDocumentationFrame(filteredTokens, config);

    // Add to current page and select
    figma.currentPage.appendChild(documentation);
    figma.currentPage.selection = [documentation];
    figma.viewport.scrollAndZoomIntoView([documentation]);

    return { success: true };
  } catch (error) {
    console.error('Error creating documentation:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error creating documentation'
    };
  }
}

/**
 * Retrieves tokens from Figma's shared data
 */
async function getTokens(): Promise<Record<string, AnyTokenList>> {
  const sharedDataHandler = new SharedDataHandler('tokens');
  const nodeManager = new NodeManager([figma.root]);

  const payload = await sharedDataHandler.getSharedData(nodeManager);
  
  if (!payload?.values) {
    throw new Error('No tokens found in the document.');
  }
  
  return payload.values;
}

/**
 * Filters tokens based on configuration
 */
function filterTokens(
  allTokens: Record<string, AnyTokenList>, 
  config: DocumentationConfig
): Record<string, AnyTokenList> {
  const result: Record<string, AnyTokenList> = {};
  
  // Filter by token sets
  config.tokenSets.forEach(set => {
    if (allTokens[set]) {
      result[set] = {};
      
      // Filter by token types if specified
      if (config.tokenTypes && config.tokenTypes.length > 0) {
        Object.entries(allTokens[set]).forEach(([type, tokens]) => {
          if (config.tokenTypes?.includes(type)) {
            result[set][type] = tokens;
          }
        });
      } else {
        result[set] = allTokens[set];
      }
    }
  });
  
  return result;
}

/**
 * Creates the main documentation frame
 */
function createDocumentationFrame(
  tokens: Record<string, AnyTokenList>,
  config: DocumentationConfig
): FrameNode {
  // Create main documentation frame
  const docFrame = figma.createFrame();
  docFrame.name = 'Token Documentation';
  docFrame.layoutMode = 'VERTICAL';
  docFrame.fills = [{ type: 'SOLID', color: { r: 0.95, g: 0.95, b: 0.95 } }];
  docFrame.paddingTop = docFrame.paddingRight = docFrame.paddingBottom = docFrame.paddingLeft = 64;
  docFrame.itemSpacing = 40;
  docFrame.counterAxisSizingMode = 'AUTO';
  docFrame.primaryAxisSizingMode = 'AUTO';
  
  // Add title
  const titleFrame = figma.createFrame();
  titleFrame.layoutMode = 'VERTICAL';
  titleFrame.fills = [];
  titleFrame.counterAxisSizingMode = 'AUTO';
  titleFrame.primaryAxisSizingMode = 'AUTO';
  
  const title = figma.createText();
  title.fontName = FONT_BOLD;
  title.fontSize = 32;
  title.characters = 'Token Documentation';
  title.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
  
  titleFrame.appendChild(title);
  docFrame.appendChild(titleFrame);
  
  // Create sections for each token set
  Object.entries(tokens).forEach(([setName, setTokens]) => {
    const setFrame = createTokenSetSection(setName, setTokens, config);
    docFrame.appendChild(setFrame);
  });
  
  return docFrame;
}

/**
 * Creates a section for a token set
 */
function createTokenSetSection(
  setName: string, 
  tokens: AnyTokenList, 
  config: DocumentationConfig
): FrameNode {
  // Create section container
  const setFrame = figma.createFrame();
  setFrame.name = `Set: ${setName}`;
  setFrame.layoutMode = 'VERTICAL';
  setFrame.fills = [];
  setFrame.counterAxisSizingMode = 'AUTO';
  setFrame.primaryAxisSizingMode = 'AUTO';
  setFrame.itemSpacing = 24;
  
  // Add section title
  const setTitle = figma.createText();
  setTitle.fontName = FONT_BOLD;
  setTitle.fontSize = 24;
  setTitle.characters = setName;
  setTitle.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
  setFrame.appendChild(setTitle);
  
  // Group by token type
  Object.entries(tokens).forEach(([type, typeTokens]) => {
    const typeSection = createTokenTypeSection(type, typeTokens, config);
    setFrame.appendChild(typeSection);
  });
  
  return setFrame;
}

/**
 * Creates a section for tokens of a specific type
 */
function createTokenTypeSection(
  type: string, 
  tokens: Record<string, SingleToken>, 
  config: DocumentationConfig
): FrameNode {
  // Create section frame
  const typeFrame = figma.createFrame();
  typeFrame.name = `Type: ${type}`;
  typeFrame.layoutMode = 'VERTICAL';
  typeFrame.fills = [];
  typeFrame.counterAxisSizingMode = 'AUTO';
  typeFrame.primaryAxisSizingMode = 'AUTO';
  typeFrame.itemSpacing = 16;
  
  // Add type title
  const typeTitle = figma.createText();
  typeTitle.fontName = FONT_MEDIUM;
  typeTitle.fontSize = 18;
  typeTitle.characters = type;
  typeTitle.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.2 } }];
  typeFrame.appendChild(typeTitle);
  
  // Create token cards container (grid or list layout)
  const cardsContainer = figma.createFrame();
  cardsContainer.name = 'Token Cards';
  cardsContainer.fills = [];
  
  if (config.layout === 'grid') {
    cardsContainer.layoutMode = 'HORIZONTAL';
    cardsContainer.itemSpacing = CARD_SPACING;
    cardsContainer.counterAxisSizingMode = 'AUTO';
    cardsContainer.primaryAxisSizingMode = 'AUTO';
    cardsContainer.layoutWrap = 'WRAP';
    cardsContainer.paddingTop = cardsContainer.paddingRight = cardsContainer.paddingLeft = cardsContainer.paddingBottom = 0;
  } else {
    cardsContainer.layoutMode = 'VERTICAL';
    cardsContainer.itemSpacing = CARD_SPACING / 2;
    cardsContainer.counterAxisSizingMode = 'AUTO';
    cardsContainer.primaryAxisSizingMode = 'AUTO';
  }
  
  // Create token cards
  Object.entries(tokens).forEach(([tokenName, tokenValue]) => {
    const card = createTokenCard(tokenName, tokenValue, type as TokenTypes, config);
    cardsContainer.appendChild(card);
  });
  
  typeFrame.appendChild(cardsContainer);
  return typeFrame;
}

/**
 * Creates an individual token card
 */
function createTokenCard(
  name: string, 
  token: SingleToken, 
  type: TokenTypes, 
  config: DocumentationConfig
): FrameNode {
  // Create card container
  const card = figma.createFrame();
  card.name = `Token: ${name}`;
  card.layoutMode = 'VERTICAL';
  card.counterAxisSizingMode = 'FIXED';
  card.primaryAxisSizingMode = 'AUTO';
  card.cornerRadius = 8;
  card.clipsContent = true;
  card.itemSpacing = 0;
  card.fills = [{ type: 'SOLID', color: BG_COLOR }];
  card.strokes = [{ type: 'SOLID', color: STROKE_COLOR }];
  card.strokeWeight = 1;
  
  // Set card width based on layout
  if (config.layout === 'grid') {
    card.resize(CARD_WIDTH, card.height);
  } else {
    card.resize(CARD_WIDTH * 2, card.height);
  }
  
  // Create card header
  const header = figma.createFrame();
  header.name = 'Header';
  header.layoutMode = 'HORIZONTAL';
  header.primaryAxisSizingMode = 'FIXED';
  header.counterAxisSizingMode = 'FIXED';
  header.resize(card.width, CARD_HEADER_HEIGHT);
  header.fills = [{ type: 'SOLID', color: HEADER_BG_COLOR }];
  header.paddingLeft = header.paddingRight = CARD_PADDING;
  header.primaryAxisAlignItems = 'SPACE_BETWEEN';
  header.counterAxisAlignItems = 'CENTER';
  
  // Add token name
  const tokenName = figma.createText();
  tokenName.fontName = FONT_BOLD;
  tokenName.fontSize = BASE_FONT_SIZE;
  tokenName.characters = name;
  tokenName.fills = [{ type: 'SOLID', color: TEXT_COLOR }];
  header.appendChild(tokenName);
  
  // Add token type indicator
  const typeText = figma.createText();
  typeText.fontName = FONT_REGULAR;
  typeText.fontSize = BASE_FONT_SIZE;
  typeText.characters = type;
  typeText.fills = [{ type: 'SOLID', color: TYPE_COLOR }];
  header.appendChild(typeText);
  
  card.appendChild(header);
  
  // Add token content
  const content = figma.createFrame();
  content.name = 'Content';
  content.layoutMode = 'VERTICAL';
  content.counterAxisSizingMode = 'FIXED';
  content.primaryAxisSizingMode = 'AUTO';
  content.fills = [];
  content.primaryAxisAlignItems = 'SPACE_BETWEEN'; 
  content.paddingTop = content.paddingRight = content.paddingBottom = content.paddingLeft = CARD_PADDING;
  content.itemSpacing = 12;
  content.resize(card.width, content.height);
  
  // Add visual representation based on token type
  if (type === TokenTypes.COLOR) {
    addColorPreview(content, token);
  } else if (type === TokenTypes.TYPOGRAPHY) {
    addTypographyPreview(content, token);
  } else if (type === TokenTypes.BORDER_RADIUS) {
    addBorderRadiusPreview(content, token);
  } else if (type === TokenTypes.SPACING || type === TokenTypes.DIMENSION || type === TokenTypes.SIZING) {
    addSpacingPreview(content, token);
  } else if (type === TokenTypes.BORDER_WIDTH) {
    addBorderWidthPreview(content, token);
  } else if (type === TokenTypes.SHADOW) {
    addShadowPreview(content, token);
  } else {
    // For other types, just show value
    addGenericPreview(content, token);
  }
  
  // Add token value if configured
  if (config.showValues) {
    addTokenValue(content, token);
  }
  
  // Add token description if configured and available
  if (config.showDescription && token.description) {
    addTokenDescription(content, token.description);
  }
  
  card.appendChild(content);
  
  return card;
}

/**
 * Adds a color preview to the token card
 */
function addColorPreview(container: FrameNode, token: SingleToken): void {
  const colorFrame = figma.createFrame();
  colorFrame.name = 'Color Preview';
  colorFrame.resize(container.width - CARD_PADDING * 2, COLOR_SWATCH_SIZE);
  colorFrame.cornerRadius = 6;
  
  try {
    // Try to parse the color value
    const colorValue = String(token.value);
    colorFrame.fills = [{ type: 'SOLID', color: parseColor(colorValue) }];
  } catch (e) {
    colorFrame.fills = [{ type: 'SOLID', color: { r: 0.8, g: 0.2, b: 0.2 } }];
  }
  
  container.appendChild(colorFrame);
}

/**
 * Adds a typography preview to the token card
 */
function addTypographyPreview(container: FrameNode, token: SingleToken): void {
  const typoFrame = figma.createFrame();
  typoFrame.name = 'Typography Preview';
  typoFrame.layoutMode = 'VERTICAL';
  typoFrame.counterAxisSizingMode = 'AUTO';
  typoFrame.primaryAxisSizingMode = 'AUTO';
  typoFrame.fills = [];
  
  const preview = figma.createText();
  preview.characters = 'The quick brown fox jumps over the lazy dog';
  preview.fills = [{ type: 'SOLID', color: TEXT_COLOR }];
  
  // Apply typography properties if available
  if (typeof token.value === 'object') {
    if (token.value.fontSize) preview.fontSize = Number(token.value.fontSize);
    if (token.value.fontWeight) preview.fontWeight = Number(token.value.fontWeight);
    if (token.value.lineHeight) {
      const lineHeight = String(token.value.lineHeight);
      if (lineHeight.endsWith('%')) {
        preview.lineHeight = { unit: 'PERCENT', value: parseFloat(lineHeight) };
      } else if (lineHeight.endsWith('px')) {
        preview.lineHeight = { unit: 'PIXELS', value: parseFloat(lineHeight) };
      } else {
        preview.lineHeight = { unit: 'PERCENT', value: parseFloat(lineHeight) * 100 };
      }
    }
  }
  
  typoFrame.appendChild(preview);
  container.appendChild(typoFrame);
}

/**
 * Adds a border radius preview to the token card
 */
function addBorderRadiusPreview(container: FrameNode, token: SingleToken): void {
  const borderRadiusFrame = figma.createFrame();
  borderRadiusFrame.name = 'Border Radius Preview';
  borderRadiusFrame.resize(container.width - CARD_PADDING * 2, 60);
  borderRadiusFrame.fills = [{ type: 'SOLID', color: { r: 0.3, g: 0.3, b: 0.3 } }];
  
  try {
    const value = parseFloat(String(token.value));
    borderRadiusFrame.cornerRadius = value;
  } catch {
    borderRadiusFrame.cornerRadius = 0;
  }
  
  container.appendChild(borderRadiusFrame);
}

/**
 * Adds a spacing preview to the token card
 */
function addSpacingPreview(container: FrameNode, token: SingleToken): void {
  const spacingFrame = figma.createFrame();
  spacingFrame.name = 'Spacing Preview';
  spacingFrame.layoutMode = 'HORIZONTAL';
  spacingFrame.counterAxisSizingMode = 'AUTO';
  spacingFrame.primaryAxisSizingMode = 'AUTO';
  spacingFrame.fills = [];
  spacingFrame.itemSpacing = 8;
  
  let value = 16; // Default value
  try {
    value = parseFloat(String(token.value));
  } catch (e) {
    // Use default
  }
  
  // Create two rectangles with spacing between them
  const rect1 = figma.createRectangle();
  rect1.resize(16, 16);
  rect1.fills = [{ type: 'SOLID', color: { r: 0.3, g: 0.3, b: 0.3 } }];
  
  const spacer = figma.createFrame();
  spacer.resize(value, 1);
  spacer.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 }, opacity: 0.3 }];
  
  const rect2 = figma.createRectangle();
  rect2.resize(16, 16);
  rect2.fills = [{ type: 'SOLID', color: { r: 0.3, g: 0.3, b: 0.3 } }];
  
  spacingFrame.appendChild(rect1);
  spacingFrame.appendChild(spacer);
  spacingFrame.appendChild(rect2);
  
  container.appendChild(spacingFrame);
}

/**
 * Adds a border width preview to the token card
 */
function addBorderWidthPreview(container: FrameNode, token: SingleToken): void {
  const borderWidthFrame = figma.createFrame();
  borderWidthFrame.name = 'Border Width Preview';
  borderWidthFrame.resize(container.width - CARD_PADDING * 2, 60);
  borderWidthFrame.fills = [];
  
  let value = 1; // Default
  try {
    value = parseFloat(String(token.value));
  } catch (e) {
    // Use default
  }
  
  borderWidthFrame.strokes = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];
  borderWidthFrame.strokeWeight = value;
  
  container.appendChild(borderWidthFrame);
}

/**
 * Adds a shadow preview to the token card
 */
function addShadowPreview(container: FrameNode, token: SingleToken): void {
  const shadowFrame = figma.createFrame();
  shadowFrame.name = 'Shadow Preview';
  shadowFrame.resize(container.width - CARD_PADDING * 2, 60);
  shadowFrame.fills = [{ type: 'SOLID', color: { r: 0.3, g: 0.3, b: 0.3 } }];
  shadowFrame.cornerRadius = 4;
  
  try {
    if (typeof token.value === 'object' && token.value !== null) {
      const shadowObj = token.value;
      shadowFrame.effects = [{
        type: shadowObj.type === 'innerShadow' ? 'INNER_SHADOW' : 'DROP_SHADOW',
        color: parseColor(shadowObj.color || '#000000'),
        offset: {
          x: parseFloat(String(shadowObj.offsetX || 0)),
          y: parseFloat(String(shadowObj.offsetY || 0)),
        },
        radius: parseFloat(String(shadowObj.blur || 0)),
        spread: parseFloat(String(shadowObj.spread || 0)),
        visible: true,
        blendMode: 'NORMAL',
      }];
    }
  } catch (e) {
    // Use default shadow
    shadowFrame.effects = [{
      type: 'DROP_SHADOW',
      color: { r: 0, g: 0, b: 0, a: 0.2 },
      offset: { x: 0, y: 2 },
      radius: 4,
      spread: 0,
      visible: true,
      blendMode: 'NORMAL',
    }];
  }
  
  container.appendChild(shadowFrame);
}

/**
 * Adds a generic preview for other token types
 */
function addGenericPreview(container: FrameNode, token: SingleToken): void {
  const previewFrame = figma.createFrame();
  previewFrame.name = 'Generic Preview';
  previewFrame.resize(container.width - CARD_PADDING * 2, 60);
  previewFrame.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.2 } }];
  previewFrame.cornerRadius = 4;
  
  const label = figma.createText();
  label.fontName = FONT_MEDIUM;
  label.fontSize = BASE_FONT_SIZE;
  label.characters = typeof token.value === 'object' 
    ? 'Complex value' 
    : String(token.value).substring(0, 25);
    
  label.fills = [{ type: 'SOLID', color: TEXT_COLOR }];
  
  // Center the label in the preview frame
  label.x = (previewFrame.width - label.width) / 2;
  label.y = (previewFrame.height - label.height) / 2;
  
  previewFrame.appendChild(label);
  container.appendChild(previewFrame);
}

/**
 * Adds value information to the token card
 */
function addTokenValue(container: FrameNode, token: SingleToken): void {
  const valueFrame = figma.createFrame();
  valueFrame.name = 'Value Info';
  valueFrame.layoutMode = 'VERTICAL';
  valueFrame.counterAxisSizingMode = 'AUTO';
  valueFrame.primaryAxisSizingMode = 'AUTO';
  valueFrame.fills = [];
  valueFrame.itemSpacing = 4;
  
  const valueLabel = figma.createText();
  valueLabel.fontName = FONT_MEDIUM;
  valueLabel.fontSize = BASE_FONT_SIZE;
  valueLabel.characters = 'Value:';
  valueLabel.fills = [{ type: 'SOLID', color: TYPE_COLOR }];
  valueFrame.appendChild(valueLabel);
  
  const valueText = figma.createText();
  valueText.fontName = FONT_REGULAR;
  valueText.fontSize = BASE_FONT_SIZE;
  valueText.characters = typeof token.value === 'object' 
    ? JSON.stringify(token.value).substring(0, 100) 
    : String(token.value).substring(0, 100);
  valueText.fills = [{ type: 'SOLID', color: VALUE_COLOR }];
  valueFrame.appendChild(valueText);
  
  container.appendChild(valueFrame);
}

/**
 * Adds description information to the token card
 */
function addTokenDescription(container: FrameNode, description: string): void {
  const descFrame = figma.createFrame();
  descFrame.name = 'Description';
  descFrame.layoutMode = 'VERTICAL';
  descFrame.counterAxisSizingMode = 'AUTO';
  descFrame.primaryAxisSizingMode = 'AUTO';
  descFrame.fills = [];
  descFrame.itemSpacing = 4;
  
  const descLabel = figma.createText();
  descLabel.fontName = FONT_MEDIUM;
  descLabel.fontSize = BASE_FONT_SIZE;
  descLabel.characters = 'Description:';
  descLabel.fills = [{ type: 'SOLID', color: TYPE_COLOR }];
  descFrame.appendChild(descLabel);
  
  const descText = figma.createText();
  descText.fontName = FONT_REGULAR;
  descText.fontSize = BASE_FONT_SIZE;
  descText.characters = description.substring(0, 200); // Limit description length
  descText.fills = [{ type: 'SOLID', color: TEXT_COLOR }];
  descFrame.appendChild(descText);
  
  container.appendChild(descFrame);
}

/**
 * Helper function to parse a color string into RGB values
 */
function parseColor(color: string): { r: number; g: number; b: number; a?: number } {
  // Default to black
  const defaultColor = { r: 0, g: 0, b: 0 };
  
  try {
    // Handle hex colors
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      if (hex.length === 3) {
        // #RGB
        const r = parseInt(hex.charAt(0) + hex.charAt(0), 16) / 255;
        const g = parseInt(hex.charAt(1) + hex.charAt(1), 16) / 255;
        const b = parseInt(hex.charAt(2) + hex.charAt(2), 16) / 255;
        return { r, g, b };
      } else if (hex.length >= 6) {
        // #RRGGBB
        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;
        return { r, g, b };
      }
    }
    
    // Handle rgba colors
    if (color.startsWith('rgba')) {
      const rgba = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)/);
      if (rgba) {
        return {
          r: parseInt(rgba[1], 10) / 255,
          g: parseInt(rgba[2], 10) / 255,
          b: parseInt(rgba[3], 10) / 255,
          a: rgba[4] ? parseFloat(rgba[4]) : 1,
        };
      }
    }
    
    // Handle rgb colors
    if (color.startsWith('rgb')) {
      const rgb = color.match(/rgb?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)/);
      if (rgb) {
        return {
          r: parseInt(rgb[1], 10) / 255,
          g: parseInt(rgb[2], 10) / 255,
          b: parseInt(rgb[3], 10) / 255,
        };
      }
    }
    
    return defaultColor;
  } catch (e) {
    return defaultColor;
  }
}

/**
 * The message handler for generating documentation
 */
export const generateDocumentation: AsyncMessageChannelHandlers[AsyncMessageTypes.GENERATE_DOCUMENTATION] = async (msg) => {
  const result = await createDocumentation(msg.config);
  
  if (!result.success && result.message) {
    notifyUI(result.message, { error: true });
  } else if (result.success) {
    notifyUI('Documentation generated successfully!');
  }
  
  return result;
};
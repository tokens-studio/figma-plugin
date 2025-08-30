export async function createText(
  name: string,
  text: string,
  fontFamily: string = 'Geist Mono',
  fontStyle: string = 'Regular',
  fontSize: number = 12,
  color: { r: number; g: number; b: number } = { r: 0, g: 0, b: 0 },
): Promise<TextNode> {
  // Load font if not already loaded
  await figma.loadFontAsync({ family: fontFamily, style: fontStyle });

  const textNode = figma.createText();
  textNode.name = name;
  textNode.fontName = { family: fontFamily, style: fontStyle };
  textNode.fontSize = fontSize;
  textNode.characters = text;
  textNode.fills = [{ type: 'SOLID', color }];

  return textNode;
}

export async function createSetHeadingTexts(setName: string, tokenCount: number) {
  const setNameText = await createText(
    'Set Name',
    setName,
    'Inter',
    'Medium',
    24,
    { r: 0, g: 0, b: 0 }, // Black
  );

  const tokenCountText = await createText(
    'Token Count',
    `${tokenCount} tokens`,
    'Inter',
    'Regular',
    12,
    { r: 0.388, g: 0.388, b: 0.388 }, // #626262
  );

  return { setNameText, tokenCountText };
}

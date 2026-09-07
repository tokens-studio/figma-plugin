export enum TokenTypes {
  OTHER = 'other',
  COLOR = 'color',
  BORDER_RADIUS = 'borderRadius',
  SIZING = 'sizing',
  SPACING = 'spacing',
  TEXT = 'text',
  TYPOGRAPHY = 'typography',
  OPACITY = 'opacity',
  BORDER_WIDTH = 'borderWidth',
  BOX_SHADOW = 'boxShadow',
  FONT_FAMILIES = 'fontFamilies',
  FONT_WEIGHTS = 'fontWeights',
  LINE_HEIGHTS = 'lineHeights',
  FONT_SIZES = 'fontSizes',
  LETTER_SPACING = 'letterSpacing',
  PARAGRAPH_SPACING = 'paragraphSpacing',
  PARAGRAPH_INDENT = 'paragraphIndent',
  TEXT_DECORATION = 'textDecoration',
  TEXT_CASE = 'textCase',
  COMPOSITION = 'composition',
  DIMENSION = 'dimension',
  BORDER = 'border',
  ASSET = 'asset',
  BOOLEAN = 'boolean',
  NUMBER = 'number',
  DURATION = 'duration',
  CUBIC_BEZIER = 'cubicBezier',
  // DTCG canonical name is `transition`. The JS identifier stays `MOTION`
  // because the UI feature ("Motion variables") reads more naturally, and
  // the plugin already accepts both `motion` and `transition` inbound.
  MOTION = 'transition',
}

export const ExportNumberVariablesTokenTypes = [
  TokenTypes.BORDER_RADIUS,
  TokenTypes.SIZING,
  TokenTypes.SPACING,
  TokenTypes.BORDER_WIDTH,
  TokenTypes.DIMENSION,
  TokenTypes.NUMBER,
  TokenTypes.FONT_SIZES,
  TokenTypes.LETTER_SPACING,
  TokenTypes.LINE_HEIGHTS,
  TokenTypes.PARAGRAPH_INDENT,
  TokenTypes.PARAGRAPH_SPACING,
  TokenTypes.OPACITY,
];

// Motion-related token types gated by the "Motion variables" export setting.
// Primary mapping: Duration -> TIMING, CubicBezier -> EASING (native Figma
// motion variable types). When the current Figma runtime hasn't opened up
// plugin-side creation of those types, setValuesOnVariable falls back to
// FLOAT (ms) and STRING (comma-separated tuple) respectively. The composite
// transition token is skipped either way — no single Figma variable type
// fits that shape.
export const ExportMotionVariablesTokenTypes = [
  TokenTypes.DURATION,
  TokenTypes.CUBIC_BEZIER,
];

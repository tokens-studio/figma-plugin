import { CodeSyntax } from './CodeSyntax';

export type VariableScope = 'ALL_SCOPES' | 'TEXT_CONTENT' | 'CORNER_RADIUS' | 'WIDTH_HEIGHT' | 'GAP' | 'OPACITY' | 'STROKE_FLOAT' | 'EFFECT_FLOAT' | 'FONT_WEIGHT' | 'FONT_SIZE' | 'LINE_HEIGHT' | 'LETTER_SPACING' | 'PARAGRAPH_SPACING' | 'PARAGRAPH_INDENT' | 'ALL_FILLS' | 'FRAME_FILL' | 'SHAPE_FILL' | 'TEXT_FILL' | 'STROKE_COLOR' | 'EFFECT_COLOR' | 'FONT_FAMILY' | 'FONT_STYLE';

export type CodeSyntaxPlatform = 'Web' | 'Android' | 'iOS';

// FigmaExtensions only covers properties in the 'com.figma' namespace
// For studio.tokens properties (like hideFromPublishing), see SingleGenericToken type
export type FigmaExtensions = {
  scopes?: VariableScope[];
  codeSyntax?: CodeSyntax;
};

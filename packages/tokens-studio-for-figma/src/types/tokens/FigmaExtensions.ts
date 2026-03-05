import { CodeSyntax } from './CodeSyntax';

export type VariableScope = 'NONE' | 'ALL_SCOPES' | 'TEXT_CONTENT' | 'CORNER_RADIUS' | 'WIDTH_HEIGHT' | 'GAP' | 'OPACITY' | 'STROKE_FLOAT' | 'EFFECT_FLOAT' | 'FONT_WEIGHT' | 'FONT_SIZE' | 'LINE_HEIGHT' | 'LETTER_SPACING' | 'PARAGRAPH_SPACING' | 'PARAGRAPH_INDENT' | 'ALL_FILLS' | 'FRAME_FILL' | 'SHAPE_FILL' | 'TEXT_FILL' | 'ALL_STROKES' | 'STROKE_COLOR' | 'EFFECT_COLOR' | 'FONT_FAMILY' | 'FONT_STYLE';

export type CodeSyntaxPlatform = 'Web' | 'Android' | 'iOS';

export type FigmaExtensions = {
    scopes?: VariableScope[];
    codeSyntax?: CodeSyntax;
    hiddenFromPublishing?: boolean;
};

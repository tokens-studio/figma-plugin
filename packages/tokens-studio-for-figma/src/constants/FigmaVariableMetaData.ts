import { TokenTypes } from './TokenTypes';
import { VariableScope, CodeSyntaxPlatform } from '@/types/tokens';

export const VARIABLE_SCOPE_OPTIONS: { value: VariableScope; label: string }[] = [
    { value: 'NONE', label: 'None' },
    { value: 'ALL_SCOPES', label: 'Show in all supported properties' },
    { value: 'TEXT_CONTENT', label: 'Text content' },
    { value: 'CORNER_RADIUS', label: 'Corner radius' },
    { value: 'WIDTH_HEIGHT', label: 'Width and height' },
    { value: 'GAP', label: 'Gap' },
    { value: 'STROKE_FLOAT', label: 'Stroke' },
    { value: 'OPACITY', label: 'Layer opacity' },
    { value: 'EFFECT_FLOAT', label: 'Effects' },
    { value: 'FONT_WEIGHT', label: 'Font weight' },
    { value: 'FONT_SIZE', label: 'Font size' },
    { value: 'LINE_HEIGHT', label: 'Line height' },
    { value: 'LETTER_SPACING', label: 'Letter spacing' },
    { value: 'PARAGRAPH_SPACING', label: 'Paragraph spacing' },
    { value: 'PARAGRAPH_INDENT', label: 'Paragraph indent' },
    { value: 'ALL_FILLS', label: 'Fill' },
    { value: 'FRAME_FILL', label: 'Frame' },
    { value: 'SHAPE_FILL', label: 'Shape' },
    { value: 'TEXT_FILL', label: 'Text' },
    { value: 'STROKE_COLOR', label: 'Stroke' },
    { value: 'EFFECT_COLOR', label: 'Effects' },
    { value: 'FONT_FAMILY', label: 'Font family' },
    { value: 'FONT_STYLE', label: 'Font style' },
];

export const TOKEN_TYPE_TO_SCOPES_MAP: Record<string, VariableScope[]> = {
    [TokenTypes.COLOR]: [
        'NONE', 'ALL_SCOPES', 'ALL_FILLS', 'FRAME_FILL', 'SHAPE_FILL', 'TEXT_FILL', 'STROKE_COLOR', 'EFFECT_COLOR',
    ],
    [TokenTypes.BORDER_RADIUS]: [
        'NONE', 'ALL_SCOPES', 'CORNER_RADIUS',
    ],
    [TokenTypes.SIZING]: [
        'NONE', 'ALL_SCOPES', 'WIDTH_HEIGHT', 'GAP',
    ],
    [TokenTypes.SPACING]: [
        'NONE', 'ALL_SCOPES', 'WIDTH_HEIGHT', 'GAP',
    ],
    [TokenTypes.DIMENSION]: [
        'NONE', 'ALL_SCOPES', 'WIDTH_HEIGHT', 'GAP', 'CORNER_RADIUS',
    ],
    [TokenTypes.BORDER_WIDTH]: [
        'NONE', 'ALL_SCOPES', 'STROKE_FLOAT',
    ],
    [TokenTypes.OPACITY]: [
        'NONE', 'ALL_SCOPES', 'OPACITY',
    ],
    [TokenTypes.FONT_FAMILIES]: [
        'NONE', 'ALL_SCOPES', 'FONT_FAMILY',
    ],
    [TokenTypes.FONT_WEIGHTS]: [
        'NONE', 'ALL_SCOPES', 'FONT_WEIGHT',
    ],
    [TokenTypes.FONT_SIZES]: [
        'NONE', 'ALL_SCOPES', 'FONT_SIZE',
    ],
    [TokenTypes.LINE_HEIGHTS]: [
        'NONE', 'ALL_SCOPES', 'LINE_HEIGHT',
    ],
    [TokenTypes.LETTER_SPACING]: [
        'NONE', 'ALL_SCOPES', 'LETTER_SPACING',
    ],
    [TokenTypes.PARAGRAPH_SPACING]: [
        'NONE', 'ALL_SCOPES', 'PARAGRAPH_SPACING',
    ],
    [TokenTypes.PARAGRAPH_INDENT]: [
        'NONE', 'ALL_SCOPES', 'PARAGRAPH_INDENT',
    ],
    [TokenTypes.TEXT]: [
        'NONE', 'ALL_SCOPES', 'TEXT_CONTENT', 'FONT_FAMILY', 'FONT_STYLE', 'FONT_WEIGHT',
    ],
    [TokenTypes.BOOLEAN]: ['NONE'],
    [TokenTypes.NUMBER]: [
        'NONE', 'ALL_SCOPES', 'TEXT_CONTENT', 'WIDTH_HEIGHT', 'GAP', 'CORNER_RADIUS', 'STROKE_FLOAT', 'EFFECT_FLOAT', 'OPACITY', 'FONT_WEIGHT', 'FONT_SIZE', 'LINE_HEIGHT', 'LETTER_SPACING', 'PARAGRAPH_SPACING', 'PARAGRAPH_INDENT',
    ],
};

export const CODE_SYNTAX_PLATFORM_OPTIONS: { value: CodeSyntaxPlatform; label: string }[] = [
    { value: 'Web', label: 'Web' },
    { value: 'Android', label: 'Android' },
    { value: 'iOS', label: 'iOS' },
];

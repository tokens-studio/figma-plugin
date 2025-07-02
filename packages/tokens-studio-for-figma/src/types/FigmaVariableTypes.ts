// Figma Variable Scopes - mirrors Figma Plugin API types
export type VariableScope =
  | 'ALL_SCOPES'
  | 'TEXT_CONTENT'
  | 'CORNER_RADIUS'
  | 'WIDTH_HEIGHT'
  | 'GAP'
  | 'ALL_FILLS'
  | 'FRAME_FILL'
  | 'SHAPE_FILL'
  | 'TEXT_FILL'
  | 'STROKE_COLOR'
  | 'FONT_SIZE'
  | 'LINE_HEIGHT'
  | 'LETTER_SPACING'
  | 'PARAGRAPH_SPACING'
  | 'PARAGRAPH_INDENT';

// Figma Code Syntax Platforms - mirrors Figma Plugin API types
export type CodeSyntaxPlatform = 'WEB' | 'ANDROID' | 'iOS';

// Token extension for Figma variable properties
export interface FigmaVariableExtensions {
  scopes?: VariableScope[];
  codeSyntax?: {
    [K in CodeSyntaxPlatform]?: string;
  };
}

// Scope options with display names for UI
export const VARIABLE_SCOPE_OPTIONS: Array<{ value: VariableScope; label: string; description?: string }> = [
  { value: 'ALL_SCOPES', label: 'All Scopes', description: 'Can be used in all contexts' },
  { value: 'TEXT_CONTENT', label: 'Text Content', description: 'For text content properties' },
  { value: 'CORNER_RADIUS', label: 'Corner Radius', description: 'For corner radius properties' },
  { value: 'WIDTH_HEIGHT', label: 'Width & Height', description: 'For width and height properties' },
  { value: 'GAP', label: 'Gap', description: 'For gap properties in auto layout' },
  { value: 'ALL_FILLS', label: 'All Fills', description: 'For all fill properties' },
  { value: 'FRAME_FILL', label: 'Frame Fill', description: 'For frame fill properties' },
  { value: 'SHAPE_FILL', label: 'Shape Fill', description: 'For shape fill properties' },
  { value: 'TEXT_FILL', label: 'Text Fill', description: 'For text fill properties' },
  { value: 'STROKE_COLOR', label: 'Stroke Color', description: 'For stroke color properties' },
  { value: 'FONT_SIZE', label: 'Font Size', description: 'For font size properties' },
  { value: 'LINE_HEIGHT', label: 'Line Height', description: 'For line height properties' },
  { value: 'LETTER_SPACING', label: 'Letter Spacing', description: 'For letter spacing properties' },
  { value: 'PARAGRAPH_SPACING', label: 'Paragraph Spacing', description: 'For paragraph spacing properties' },
  { value: 'PARAGRAPH_INDENT', label: 'Paragraph Indent', description: 'For paragraph indent properties' },
];

// Code syntax platform options for UI
export const CODE_SYNTAX_PLATFORM_OPTIONS: Array<{ value: CodeSyntaxPlatform; label: string }> = [
  { value: 'WEB', label: 'Web' },
  { value: 'ANDROID', label: 'Android' },
  { value: 'iOS', label: 'iOS' },
];
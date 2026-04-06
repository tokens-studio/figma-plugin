import { CodeSyntax, VariableScope as TokenVariableScope } from '@/types/tokens';

export const FIGMA_PLATFORMS = [
  { key: 'Web', figma: 'WEB' },
  { key: 'Android', figma: 'ANDROID' },
  { key: 'iOS', figma: 'iOS' },
] as const;

/**
 * Normalizes variable scopes by handling 'ALL_SCOPES' and platform-specific constraints.
 * Figma uses an empty array [] to represent all/unrestricted scopes.
 */
export function normalizeVariableScopes(scopes: TokenVariableScope[]): VariableScope[] {
  if (scopes.includes('NONE')) {
    return [];
  }

  if (scopes.includes('ALL_SCOPES')) {
    return ['ALL_SCOPES'];
  }

  let newScopes = [...scopes];

  if (newScopes.includes('ALL_FILLS')) {
    newScopes = newScopes.filter((s) => !['FRAME_FILL', 'SHAPE_FILL', 'TEXT_FILL'].includes(s));
  }

  if (newScopes.includes('ALL_STROKES')) {
    newScopes = newScopes.filter((s) => s !== 'STROKE_COLOR');
  }

  return newScopes.filter((s): s is VariableScope => s !== 'NONE' && s !== 'ALL_STROKES');
}

/**
 * Extracts code syntax for a given platform key, checking both PascalCase and lowercase variations.
 */
export function getCodeSyntaxValue(codeSyntax: CodeSyntax, key: string): string | undefined {
  if (codeSyntax[key] !== undefined) return codeSyntax[key];
  if (codeSyntax[key.toLowerCase()] !== undefined) return codeSyntax[key.toLowerCase()];
  if (codeSyntax[key.toUpperCase()] !== undefined) return codeSyntax[key.toUpperCase()];
  return undefined;
}

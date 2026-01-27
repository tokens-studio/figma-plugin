import { CodeSyntax } from '@/types/tokens';

export const FIGMA_PLATFORMS = [
    { key: 'Web', figma: 'WEB' },
    { key: 'Android', figma: 'ANDROID' },
    { key: 'iOS', figma: 'iOS' },
] as const;

/**
 * Normalizes variable scopes by handling 'ALL_SCOPES' and platform-specific constraints.
 * Figma uses an empty array [] to represent all/unrestricted scopes.
 */
export function normalizeVariableScopes(scopes: string[]): VariableScope[] {
    let newScopes = [...scopes] as VariableScope[];

    if (newScopes.includes('ALL_SCOPES' as VariableScope)) {
        return [];
    }

    if (newScopes.includes('ALL_FILLS' as VariableScope)) {
        newScopes = newScopes.filter((s) => !['FRAME_FILL', 'SHAPE_FILL', 'TEXT_FILL'].includes(s));
    }

    if (newScopes.includes('ALL_STROKES' as VariableScope)) {
        newScopes = newScopes.filter((s) => s !== 'STROKE_COLOR');
    }

    return newScopes;
}

/**
 * Extracts code syntax for a given platform key, checking both PascalCase and lowercase variations.
 */
export function getCodeSyntaxValue(codeSyntax: CodeSyntax, key: string): string | undefined {
    return codeSyntax[key] !== undefined
        ? codeSyntax[key]
        : codeSyntax[key.toLowerCase()];
}

import { TokenTypes } from '@/constants/TokenTypes';
import { ThemeObject } from '@/types';
import { AnyTokenList } from '@/types/tokens';
import { generateTokensToCreate } from '@/plugin/generateTokensToCreate';
import { getOverallConfig } from './tokenHelpers';

export type GradientTokenWithStaleVariable = {
  name: string;
  // Figma variable keys that can safely be deleted for this token
  variableKeys: string[];
};

const isGradient = (v: unknown): v is string => typeof v === 'string'
  && (v.startsWith('linear-gradient') || v.startsWith('radial-gradient') || v.startsWith('conic-gradient'));

// Color tokens that resolve to a gradient but still have a Figma variable from an
// earlier export. Checked per theme on the resolved value, mirroring what the export
// does (checkIfTokenCanCreateVariable), so a token that's a gradient in one set but a
// solid color in the theme that owns the variable isn't flagged. A variable is only
// offered for deletion when no theme referencing it still resolves to a non-gradient
// value — otherwise the export would just recreate it and the prompt would loop.
export function findGradientTokensWithStaleVariables(
  tokens: Record<string, AnyTokenList>,
  themes: ThemeObject[],
): GradientTokenWithStaleVariable[] {
  // Cheap bail-out: a gradient can only come from a raw gradient string somewhere
  const hasAnyGradient = Object.values(tokens).some((list) => list.some((token) => token.type === TokenTypes.COLOR
    && typeof token.value === 'string' && token.value.includes('-gradient(')));
  if (!hasAnyGradient) return [];

  const themesWithRefs = themes.filter((theme) => Object.keys(theme.$figmaVariableReferences ?? {}).length > 0);
  if (themesWithRefs.length === 0) return [];

  const overallConfig = getOverallConfig(themes, themesWithRefs.map((theme) => theme.id));

  const gradientKeys = new Set<string>();
  const keepKeys = new Set<string>();
  // variable key -> token names referencing it
  const namesByKey = new Map<string, Set<string>>();

  themesWithRefs.forEach((theme) => {
    const { tokensToCreate } = generateTokensToCreate({ theme, tokens, overallConfig });
    const resolvedByName = new Map(tokensToCreate.map((token) => [token.name, token]));

    Object.entries(theme.$figmaVariableReferences ?? {}).forEach(([name, key]) => {
      const token = resolvedByName.get(name);
      // Token isn't exported by this theme — says nothing about the variable
      if (!token) return;
      if (token.type === TokenTypes.COLOR && isGradient(token.value)) {
        gradientKeys.add(key);
        if (!namesByKey.has(key)) namesByKey.set(key, new Set());
        namesByKey.get(key)!.add(name);
      } else {
        keepKeys.add(key);
      }
    });
  });

  const keysByName = new Map<string, Set<string>>();
  gradientKeys.forEach((key) => {
    if (keepKeys.has(key)) return;
    namesByKey.get(key)?.forEach((name) => {
      if (!keysByName.has(name)) keysByName.set(name, new Set());
      keysByName.get(name)!.add(key);
    });
  });

  return Array.from(keysByName.entries()).map(([name, keys]) => ({ name, variableKeys: Array.from(keys) }));
}

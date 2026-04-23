import { ImportToken } from '@/types/tokens';
import { isEqual } from './isEqual';
import { ThemeObject } from '@/types';
import { RemoteTokenStorageMetadata } from '@/storage/RemoteTokenStorage';

export type CompareStateType<Metadata = null> = {
  tokens: Record<string, ImportToken[]>
  themes: ImportTheme[]
  metadata?: RemoteTokenStorageMetadata | Metadata
};

export type ImportTheme = ThemeObject & {
  importType?: 'NEW' | 'UPDATE' | 'REMOVE'
};

export function findDifferentState(baseState: CompareStateType, compareState: CompareStateType): CompareStateType {
  const entries: [string, ImportToken[]][] = [];
  Object.entries(compareState.tokens)?.forEach(([tokenSet, values]) => {
    const newTokens: ImportToken[] = [];
    const updatedTokens: ImportToken[] = [];
    const removedTokens: ImportToken[] = [];
    // Find different tokens and new tokens in compareState
    values.forEach((token) => {
      const oldValue = baseState.tokens[tokenSet]?.find((t) => t.name === token.name);
      if (oldValue) {
        const valueChanged = !isEqual(oldValue.value, token.value);
        const descriptionChanged = !isEqual(oldValue.description, token.description);
        const deprecatedChanged = !isEqual(oldValue.$deprecated, token.$deprecated);
        if (valueChanged || descriptionChanged || deprecatedChanged) {
          const updatedToken: ImportToken = { ...token, importType: 'UPDATE' };
          if (valueChanged) updatedToken.oldValue = oldValue.value;
          if (descriptionChanged) updatedToken.oldDescription = oldValue.description;
          if (deprecatedChanged) updatedToken.oldDeprecated = oldValue.$deprecated ?? false;
          updatedTokens.push(updatedToken);
        }
      } else {
        newTokens.push({ ...token, importType: 'NEW' });
      }
    });
    // Find the new tokens in baseState
    baseState.tokens[tokenSet]?.forEach((token) => {
      const oldValue = compareState.tokens[tokenSet]?.find((t) => t.name === token.name);
      if (!oldValue) {
        removedTokens.push({ ...token, importType: 'REMOVE' });
      }
    });
    const totalUpdatedTokens = [...newTokens, ...updatedTokens, ...removedTokens];
    entries.push([tokenSet, totalUpdatedTokens]);
  });

  // Find the new tokenSet in baseState
  Object.entries(baseState.tokens).forEach(([tokenSet, values]) => {
    const isTokenSetRemoved = typeof compareState.tokens[tokenSet] === 'undefined';
    if (isTokenSetRemoved) {
      entries.push([tokenSet, values.map((token) => ({ ...token, importType: 'REMOVE' }))]);
    }
  });

  const changedThemes: ImportTheme[] = [];
  const newThemes: ImportTheme[] = [];
  const removedThemes: ImportTheme[] = [];
  compareState.themes.forEach((theme) => {
    const oldTheme = baseState.themes.find((t) => t.id === theme.id);
    if (oldTheme) {
      if (!isEqual(theme, oldTheme)) {
        changedThemes.push({ ...theme, importType: 'UPDATE' });
      }
    } else {
      newThemes.push({ ...theme, importType: 'NEW' });
    }
  });

  baseState.themes.forEach((theme) => {
    if (!compareState.themes.find((t) => t.id === theme.id)) {
      removedThemes.push({ ...theme, importType: 'REMOVE' });
    }
  });

  return {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tokens: Object.fromEntries(entries.filter(([_, tokens]) => tokens.length > 0)),
    themes: [...newThemes, ...changedThemes, ...removedThemes],
    metadata: !isEqual(baseState.metadata, compareState.metadata) ? compareState.metadata : null,
  };
}

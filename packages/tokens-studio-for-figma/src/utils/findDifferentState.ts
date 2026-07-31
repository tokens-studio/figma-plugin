import { ImportToken } from '@/types/tokens';
import { isEqual } from './isEqual';
import { ThemeObject } from '@/types';
import { RemoteTokenStorageMetadata } from '@/storage/RemoteTokenStorage';

export type TokenSetChangeType = 'NEW' | 'REMOVE';

export type CompareStateType<Metadata = null> = {
  tokens: Record<string, ImportToken[]>
  themes: ImportTheme[]
  metadata?: RemoteTokenStorageMetadata | Metadata
  // Set-level additions/removals. Token-level diffs can't represent an empty
  // set being added or removed (its token list is empty either way), so those
  // changes are tracked here. Undefined when there are none.
  tokenSetChanges?: Record<string, TokenSetChangeType>
};

export type ImportTheme = ThemeObject & {
  importType?: 'NEW' | 'UPDATE' | 'REMOVE'
};

export function findDifferentState(baseState: CompareStateType, compareState: CompareStateType): CompareStateType {
  const entries: [string, ImportToken[]][] = [];
  const tokenSetChanges: Record<string, TokenSetChangeType> = {};
  Object.entries(compareState.tokens)?.forEach(([tokenSet, values]) => {
    if (typeof baseState.tokens[tokenSet] === 'undefined') {
      tokenSetChanges[tokenSet] = 'NEW';
    }
    const newTokens: ImportToken[] = [];
    const updatedTokens: ImportToken[] = [];
    const removedTokens: ImportToken[] = [];
    // Find different tokens and new tokens in compareState
    values.forEach((token) => {
      const oldValue = baseState.tokens[tokenSet]?.find((t) => t.name === token.name);
      if (oldValue) {
        const valueChanged = !isEqual(oldValue.value, token.value);
        const extensionsChanged = !isEqual(oldValue.$extensions, token.$extensions);
        if (valueChanged || extensionsChanged) {
          const updatedToken: ImportToken = { ...token };
          if (valueChanged) updatedToken.oldValue = oldValue.value;
          updatedToken.importType = 'UPDATE';
          updatedTokens.push(updatedToken);
        }
        if (!isEqual(oldValue.description, token.description)) {
          updatedTokens.push({
            ...token,
            oldDescription: oldValue.description,
            importType: 'UPDATE',
          });
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
      tokenSetChanges[tokenSet] = 'REMOVE';
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
    tokenSetChanges: Object.keys(tokenSetChanges).length > 0 ? tokenSetChanges : undefined,
  };
}

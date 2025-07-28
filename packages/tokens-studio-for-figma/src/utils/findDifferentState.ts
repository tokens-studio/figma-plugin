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
  // Log problematic token sets for debugging
  const problematicSets = ['tce/fosse-park/components/image-text', 'tce/the-gate/components/features-accordion'];

  const entries: [string, ImportToken[]][] = [];
  Object.entries(compareState.tokens)?.forEach(([tokenSet, values]) => {
    const newTokens: ImportToken[] = [];
    const updatedTokens: ImportToken[] = [];
    const removedTokens: ImportToken[] = [];

    // Debug logging for problematic token sets
    if (problematicSets.includes(tokenSet)) {
      console.log(`🔍 DEBUGGING TOKEN SET: ${tokenSet}`);
      console.log(`   BASE STATE (local) tokens:`, baseState.tokens[tokenSet]?.map(t => t.name) || []);
      console.log(`   COMPARE STATE (remote) tokens:`, values.map(t => t.name));
    }

    // Find different tokens and new tokens in compareState
    values.forEach((token) => {
      const oldValue = baseState.tokens[tokenSet]?.find((t) => t.name === token.name);
      if (oldValue) {
        if (!isEqual(oldValue.value, token.value)) {
          console.log(`🔄 VALUE CHANGED: ${tokenSet} -> ${token.name}`);
          console.log(`   OLD:`, oldValue.value);
          console.log(`   NEW:`, token.value);
          const updatedToken: ImportToken = { ...token };
          updatedToken.oldValue = oldValue.value;
          updatedToken.importType = 'UPDATE';
          updatedTokens.push(updatedToken);
        }
        if (!isEqual(oldValue.description, token.description)) {
          console.log(`📝 DESCRIPTION CHANGED: ${tokenSet} -> ${token.name}`);
          updatedTokens.push({
            ...token,
            oldDescription: oldValue.description,
            importType: 'UPDATE',
          });
        }
      } else {
        console.log(`🆕 NEW TOKEN: ${tokenSet} -> ${token.name}`);
        newTokens.push({ ...token, importType: 'NEW' });
      }
    });

    // Find the new tokens in baseState
    baseState.tokens[tokenSet]?.forEach((token) => {
      const oldValue = compareState.tokens[tokenSet]?.find((t) => t.name === token.name);
      if (!oldValue) {
        console.log(`❌ REMOVE TOKEN: ${tokenSet} -> ${token.name}`);
        console.log(`   LOCAL TOKEN:`, token);
        console.log(`   REMOTE TOKEN SET EXISTS:`, !!compareState.tokens[tokenSet]);
        console.log(`   REMOTE TOKEN SET SIZE:`, compareState.tokens[tokenSet]?.length || 0);
        console.log(`   REMOTE TOKEN NAMES:`, compareState.tokens[tokenSet]?.map(t => t.name) || []);
        removedTokens.push({ ...token, importType: 'REMOVE' });
      }
    });

    const totalUpdatedTokens = [...newTokens, ...updatedTokens, ...removedTokens];
    if (totalUpdatedTokens.length > 0) {
      console.log(`📊 SUMMARY ${tokenSet}: ${newTokens.length} new, ${updatedTokens.length} updated, ${removedTokens.length} removed`);
    }
    entries.push([tokenSet, totalUpdatedTokens]);
  });

  // Find the new tokenSet in baseState
  Object.entries(baseState.tokens).forEach(([tokenSet, values]) => {
    const isTokenSetRemoved = typeof compareState.tokens[tokenSet] === 'undefined';

    // Debug logging for problematic token sets
    if (problematicSets.includes(tokenSet)) {
      console.log(`🔍 CHECKING TOKEN SET REMOVAL: ${tokenSet}`);
      console.log(`   Token set exists in compare state:`, !isTokenSetRemoved);
      console.log(`   Compare state keys:`, Object.keys(compareState.tokens));
    }

    if (isTokenSetRemoved) {
      console.log(`🗑️ REMOVE ENTIRE TOKEN SET: ${tokenSet} (${values.length} tokens)`);
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

  const result = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tokens: Object.fromEntries(entries.filter(([_, tokens]) => tokens.length > 0)),
    themes: [...newThemes, ...changedThemes, ...removedThemes],
    metadata: !isEqual(baseState.metadata, compareState.metadata) ? compareState.metadata : null,
  };

  // Only log if there are actual changes
  const hasChanges = Object.keys(result.tokens).length > 0 || result.themes.length > 0 || result.metadata;
  if (hasChanges) {
    console.log('🎯 FINAL CHANGES SUMMARY:');
    console.log(`   Token sets with changes: ${Object.keys(result.tokens).length}`);
    console.log(`   Theme changes: ${result.themes.length}`);
    console.log(`   Metadata changes: ${!!result.metadata}`);
  }

  return result;
}

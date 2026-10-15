import type { RematchDispatch } from '@rematch/core';
import type { RootModel } from '@/types/RootModel';
import type { RootState } from '@/app/store';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { track } from '@/utils/analytics';
import { findRenamedVariableTokens } from './utils/findRenamedVariableTokens';

// With Tokens Studio sync a variables import has already been written to the project by
// setTokensFromVariables and setThemesFromVariables, so there is nothing left to choose in
// ImportedTokensDialog. Apply the import as its "Import all" would instead of showing it.
// Returns whether it applied the import; other providers keep the dialog.
export function applyVariableImport(dispatch: RematchDispatch<RootModel>) {
  return (_payload: void, rootState: RootState): boolean => {
    if (rootState.uiState.api?.provider !== StorageProviderType.TOKENS_STUDIO_OAUTH) return false;

    const {
      importedTokens, importedThemes, renamedCollections, activeTokenSet, themes,
    } = rootState.tokenState;
    const { newTokens, updatedTokens } = importedTokens;

    // Apply the themes before the Studio pushes come back, so that each new theme is found
    // locally and gets the id Studio assigned to it.
    if (importedThemes.newThemes.length > 0 || importedThemes.updatedThemes.length > 0) {
      dispatch.tokenState.setThemes(themes);
    }

    if (renamedCollections && renamedCollections.length > 0) {
      dispatch.tokenState.handleRenamedCollections(renamedCollections);
      dispatch.tokenState.setRenamedCollections(null);
    }

    // `themes` is from before setThemes above, so it still has the old variable references.
    const tokenRenames = findRenamedVariableTokens(themes, importedThemes.updatedThemes);
    if (tokenRenames.length > 0) dispatch.tokenState.renameImportedVariableTokens(tokenRenames);

    dispatch.tokenState.applyImportedVariableTokens();

    const combinedTokens = [...updatedTokens, ...newTokens];
    const importedTokenSets = [...new Set(combinedTokens.map((token) => token.parent).filter((parent): parent is string => !!parent))];
    if (importedTokenSets.length > 0 && !importedTokenSets.includes(activeTokenSet)) {
      dispatch.tokenState.setActiveTokenSet(importedTokenSets[0]);
    }

    if (combinedTokens.length > 0) {
      track('Import variables', {
        totalCount: combinedTokens.length,
        updatedCount: updatedTokens.length,
        newCount: newTokens.length,
        colorTokens: combinedTokens.filter((token) => token.type === 'color').length,
        textTokens: combinedTokens.filter((token) => token.type === 'text').length,
        numberTokens: combinedTokens.filter((token) => token.type === 'number').length,
        booleanTokens: combinedTokens.filter((token) => token.type === 'boolean').length,
        dimensionTokens: combinedTokens.filter((token) => token.type === 'dimension').length,
        collectionCount: importedTokenSets.length,
        appliedWithoutReview: true,
      });
    }

    return true;
  };
}

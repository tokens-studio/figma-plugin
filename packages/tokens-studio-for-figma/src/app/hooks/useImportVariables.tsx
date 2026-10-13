import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { VariableCollectionInfo, SelectedCollections } from '@/types/VariableCollectionSelection';
import { ThemeObjectsList } from '@/types/ThemeObjectsList';
import { track } from '@/utils/analytics';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { apiSelector, isTokensStudioSyncSelector } from '@/selectors';
import useConfirm from './useConfirm';

export function useImportVariables() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [collections, setCollections] = useState<VariableCollectionInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isTokensStudioSync = useSelector(isTokensStudioSyncSelector);
  const api = useSelector(apiSelector);
  const { confirm } = useConfirm();
  const { t } = useTranslation(['tokens']);
  // setTokensFromVariables and setThemesFromVariables decide on `api.provider` whether to write to Tokens Studio.
  const writesToTokensStudio = isTokensStudioSync || api?.provider === StorageProviderType.TOKENS_STUDIO_OAUTH;
  const branch = (api as { branch?: string } | undefined)?.branch;

  const openDialog = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch available collections first
      const response = await AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.GET_AVAILABLE_VARIABLE_COLLECTIONS,
      });

      setCollections(response.collections);
      setIsDialogOpen(true);
    } catch (error) {
      console.error('Error fetching variable collections:', error);
      setCollections([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
    setCollections([]);
  }, []);

  const importVariables = useCallback(async (
    selectedCollections: SelectedCollections,
    options: { useDimensions: boolean; useRem: boolean },
    themes: ThemeObjectsList,
    proUser: boolean,
  ) => {
    try {
      // Calculate analytics data
      const selectedCollectionIds = Object.keys(selectedCollections);
      const totalSelectedModes = selectedCollectionIds.reduce((count, collectionId) => count + selectedCollections[collectionId].selectedModes.length, 0);
      const totalAvailableModes = collections.reduce((count, collection) => count + collection.modes.length, 0);

      // With Tokens Studio sync the imported sets, tokens and themes are written to the project as soon as
      // the plugin answers, so ask before anything is pulled. Cancelling leaves the plugin and Studio untouched.
      if (writesToTokensStudio) {
        // Every selected mode becomes a token set (and a theme), holding one token per variable in its collection.
        const totalTokens = collections.reduce((count, collection) => (
          count + (collection.variableCount ?? 0) * (selectedCollections[collection.id]?.selectedModes.length ?? 0)
        ), 0);
        const confirmResult = await confirm({
          text: t('importVariablesStudioConfirmTitle') as string,
          description: [
            branch
              ? t('importVariablesStudioConfirmDescriptionBranch', { branch })
              : t('importVariablesStudioConfirmDescription'),
            t('importVariablesStudioConfirmCounts', {
              sets: totalSelectedModes,
              tokens: totalTokens,
              themes: proUser ? totalSelectedModes : 0,
            }),
          ].join(' '),
          confirmAction: t('importVariablesStudioConfirmAction') as string,
          cancelAction: t('cancel') as string,
        });
        if (!confirmResult) return;
      }

      // Track analytics
      track('Import Variables', {
        useDimensions: options.useDimensions,
        useRem: options.useRem,
        selectedCollections: selectedCollectionIds.length,
        totalCollections: collections.length,
        selectedModes: totalSelectedModes,
        totalModes: totalAvailableModes,
      });

      await AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.PULL_VARIABLES,
        options: {
          useDimensions: options.useDimensions,
          useRem: options.useRem,
          selectedCollections,
        },
        themes,
        proUser,
      });
      closeDialog();
    } catch (error) {
      console.error('Error importing variables:', error);
    }
  }, [closeDialog, collections, writesToTokensStudio, branch, confirm, t]);

  return {
    isDialogOpen,
    collections,
    isLoading,
    openDialog,
    closeDialog,
    importVariables,
  };
}

import { useState, useCallback } from 'react';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { VariableCollectionInfo, SelectedCollections } from '@/types/VariableCollectionSelection';
import { ThemeObjectsList } from '@/types/ThemeObjectsList';

export function useImportVariables() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [collections, setCollections] = useState<VariableCollectionInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    proUser: boolean
  ) => {
    try {
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
  }, [closeDialog]);

  return {
    isDialogOpen,
    collections,
    isLoading,
    openDialog,
    closeDialog,
    importVariables,
  };
}
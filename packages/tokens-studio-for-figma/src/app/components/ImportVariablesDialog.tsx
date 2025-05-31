import React, { useState, useCallback, useEffect } from 'react';
import {
  Button, Checkbox, Label, Stack, Heading,
} from '@tokens-studio/ui';
import Modal from './Modal';
import Box from './Box';
import { VariableCollectionInfo, SelectedCollections } from '@/types/VariableCollectionSelection';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedCollections: SelectedCollections, options: { useDimensions: boolean; useRem: boolean }) => void;
  collections: VariableCollectionInfo[];
};

export default function ImportVariablesDialog({
  isOpen, onClose, onConfirm, collections,
}: Props) {
  const [selectedCollections, setSelectedCollections] = useState<SelectedCollections>({});
  const [useDimensions, setUseDimensions] = useState(false);
  const [useRem, setUseRem] = useState(false);

  // Initialize all collections as selected with all modes selected by default
  useEffect(() => {
    if (collections.length > 0) {
      const initialSelection: SelectedCollections = {};
      collections.forEach((collection) => {
        initialSelection[collection.id] = {
          name: collection.name,
          selectedModes: collection.modes.map((mode) => mode.modeId),
        };
      });
      setSelectedCollections(initialSelection);
    }
  }, [collections]);

  const handleCollectionToggle = useCallback((collectionId: string, collectionName: string, modes: { modeId: string; name: string }[]) => {
    setSelectedCollections((prev) => {
      const isCurrentlySelected = prev[collectionId];
      if (isCurrentlySelected) {
        // Remove collection
        const newSelection = { ...prev };
        delete newSelection[collectionId];
        return newSelection;
      }
      // Add collection with all modes selected
      return {
        ...prev,
        [collectionId]: {
          name: collectionName,
          selectedModes: modes.map((mode) => mode.modeId),
        },
      };
    });
  }, []);

  const handleModeToggle = useCallback((collectionId: string, modeId: string) => {
    setSelectedCollections((prev) => {
      const collection = prev[collectionId];
      if (!collection) return prev;

      const isCurrentlySelected = collection.selectedModes.includes(modeId);
      const newSelectedModes = isCurrentlySelected
        ? collection.selectedModes.filter((id) => id !== modeId)
        : [...collection.selectedModes, modeId];

      // If no modes are selected, remove the collection entirely
      if (newSelectedModes.length === 0) {
        const newSelection = { ...prev };
        delete newSelection[collectionId];
        return newSelection;
      }

      return {
        ...prev,
        [collectionId]: {
          ...collection,
          selectedModes: newSelectedModes,
        },
      };
    });
  }, []);

  const handleConfirm = useCallback(() => {
    onConfirm(selectedCollections, { useDimensions, useRem });
  }, [selectedCollections, useDimensions, useRem, onConfirm]);

  const hasSelections = Object.keys(selectedCollections).length > 0;

  return (
    <Modal
      title="Import variables"
      showClose
      isOpen={isOpen}
      close={onClose}
      footer={(
        <Stack direction="row" gap={4} justify="between">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" disabled={!hasSelections} onClick={handleConfirm}>
            Import
          </Button>
        </Stack>
      )}
    >
      <Stack direction="column" gap={4} css={{ padding: '$4' }}>
        <Box css={{ fontSize: '$small', color: '$fgMuted' }}>
          Select which variable collections and modes to import. Sets will be created for each selected mode.
        </Box>

        {/* Options */}
        <Stack direction="column" gap={2}>
          <Heading size="small">Options</Heading>
          <Stack direction="row" gap={2} align="center">
            <Checkbox
              checked={useDimensions}
              onCheckedChange={(checked) => setUseDimensions(checked === true)}
              id="useDimensions"
            />
            <Label htmlFor="useDimensions">
              Convert numbers to dimensions
            </Label>
          </Stack>
          <Stack direction="row" gap={2} align="center">
            <Checkbox
              checked={useRem}
              onCheckedChange={(checked) => setUseRem(checked === true)}
              id="useRem"
            />
            <Label htmlFor="useRem">
              Use rem for dimension values
            </Label>
          </Stack>
        </Stack>

        {/* Collections */}
        <Stack direction="column" gap={3}>
          <Heading size="small">Variable Collections</Heading>
          {collections.length === 0 ? (
            <Box css={{
              padding: '$3', backgroundColor: '$bgMuted', borderRadius: '$small', textAlign: 'center',
            }}
            >
              There are no collections present in this file
            </Box>
          ) : (
            collections.map((collection) => {
              const isCollectionSelected = !!selectedCollections[collection.id];
              const selectedModes = selectedCollections[collection.id]?.selectedModes || [];
              const allModesSelected = isCollectionSelected && selectedModes.length === collection.modes.length;

              return (
                <Box key={collection.id} css={{ borderLeft: '2px solid $borderMuted', paddingLeft: '$3' }}>
                  <Stack direction="column" gap={2}>
                    <Stack direction="row" gap={2} align="center">
                      <Checkbox
                        checked={isCollectionSelected}
                        onCheckedChange={() => handleCollectionToggle(collection.id, collection.name, collection.modes)}
                        id={`collection-${collection.id}`}
                      />
                      <Label htmlFor={`collection-${collection.id}`} css={{ color: '$fgDefault', fontWeight: 'bold', userSelect: 'none' }}>
                        {collection.name || `Collection ${collection.id.slice(0, 8)}`}
                      </Label>
                    </Stack>

                    {isCollectionSelected && (
                    <Stack direction="column" gap={1} css={{ marginLeft: '$4' }}>
                      {collection.modes.map((mode) => (
                        <Stack key={mode.modeId} direction="row" gap={2} align="center">
                          <Checkbox
                            checked={selectedModes.includes(mode.modeId)}
                            onCheckedChange={() => handleModeToggle(collection.id, mode.modeId)}
                            id={`mode-${collection.id}-${mode.modeId}`}
                          />
                          <Label htmlFor={`mode-${collection.id}-${mode.modeId}`} css={{ color: '$fgDefault', userSelect: 'none' }}>
                            {mode.name || `Mode ${mode.modeId.slice(0, 8)}`}
                          </Label>
                        </Stack>
                      ))}
                    </Stack>
                    )}
                  </Stack>
                </Box>
              );
            })
          )}
        </Stack>

        {!hasSelections && (
          <Box css={{
            padding: '$3', backgroundColor: '$dangerBg', color: '$dangerFg', borderRadius: '$small',
          }}
          >
            Please select at least one collection and mode to import.
          </Box>
        )}
      </Stack>
    </Modal>
  );
}

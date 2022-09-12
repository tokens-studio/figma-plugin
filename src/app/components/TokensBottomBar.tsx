import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ApplySelector from './ApplySelector';
import ExportModal from './modals/ExportModal';
import PresetModal from './modals/PresetModal';
import Box from './Box';
import StylesDropdown from './StylesDropdown';
import { editProhibitedSelector, hasUnsavedChangesSelector } from '@/selectors';
import Button from './Button';
import { useShortcut } from '@/hooks/useShortcut';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { Dispatch } from '../store';

type Props = {
  handleUpdate: () => void;
  handleSaveJSON: () => void;
  hasJSONError: boolean;
};

export default function TokensBottomBar({ handleUpdate, handleSaveJSON, hasJSONError }: Props) {
  const editProhibited = useSelector(editProhibitedSelector);
  const hasUnsavedChanges = useSelector(hasUnsavedChangesSelector);
  const dispatch = useDispatch<Dispatch>();

  const [exportModalVisible, showExportModal] = React.useState(false);
  const [presetModalVisible, showPresetModal] = React.useState(false);

  const handleSaveShortcut = useCallback((event: KeyboardEvent) => {
    if (event.metaKey || event.ctrlKey) {
      handleSaveJSON();
    }
  }, [handleSaveJSON]);

  useShortcut(['KeyS'], handleSaveShortcut);

  const handleShowPresetModal = useCallback(() => {
    showPresetModal(true);
  }, []);

  const handleClosePresetModal = useCallback(() => {
    showPresetModal(false);
  }, []);

  const handleShowExportModal = useCallback(() => {
    showExportModal(true);
  }, []);

  const handleCloseExportModal = useCallback(() => {
    showExportModal(false);
  }, []);

  const handleExtract = useCallback(() => {
    showExportModal(false);

    AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.EXTRACT_TOKENS_FROM_SELECTION,
      categories: ['color'],
    }).then(({ uniqueValues }) => {
      dispatch.tokenState.setTokensFromStyles(uniqueValues);

      console.log('uniqueValues', uniqueValues);
    });
  }, [dispatch.tokenState]);

  return (
    <Box css={{
      width: '100%', backgroundColor: '$bgDefault', borderBottom: '1px solid', borderColor: '$borderMuted',
    }}
    >
      {hasUnsavedChanges ? (
        <Box
          css={{
            padding: '$3 $4',
            display: 'flex',
            gap: '$1',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box css={{ fontSize: '$xsmall' }}>Unsaved changes</Box>
          <Button variant="primary" disabled={hasJSONError} onClick={handleSaveJSON}>
            Save JSON
          </Button>
        </Box>
      )
        : (
          <Box css={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', gap: '$2', padding: '$3 $4',
          }}
          >
            <ApplySelector />
            <Box css={{ display: 'flex', flexDirection: 'row', gap: '$2' }}>
              <Button variant="ghost" disabled={editProhibited} onClick={handleShowPresetModal}>
                Load
              </Button>
              <Button variant="ghost" onClick={handleShowExportModal}>
                Export
              </Button>
              <Button variant="ghost" onClick={handleExtract}>
                Extract
              </Button>
              <StylesDropdown />
              <Button variant="primary" onClick={handleUpdate}>
                Update
              </Button>

            </Box>
          </Box>
        )}
      {exportModalVisible && <ExportModal onClose={handleCloseExportModal} />}
      {presetModalVisible && <PresetModal onClose={handleClosePresetModal} />}
    </Box>
  );
}

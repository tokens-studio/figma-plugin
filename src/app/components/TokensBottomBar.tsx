import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import ApplySelector from './ApplySelector';
import ExportModal from './modals/ExportModal';
import PresetModal from './modals/PresetModal';
import Box from './Box';
import StylesDropdown from './StylesDropdown';
import { editProhibitedSelector, hasUnsavedChangesSelector } from '@/selectors';
import Button from './Button';
import Stack from './Stack';
import SettingsDropdown from './SettingsDropdown';
import useTokens from '../store/useTokens';
import { stringTokensSelector } from '@/selectors/stringTokensSelector';

type Props = {
  hasJSONError: boolean;
};

export default function TokensBottomBar({ hasJSONError }: Props) {
  const editProhibited = useSelector(editProhibitedSelector);
  const hasUnsavedChanges = useSelector(hasUnsavedChangesSelector);
  const stringTokens = useSelector(stringTokensSelector);

  const { handleJSONUpdate } = useTokens();

  const [exportModalVisible, showExportModal] = React.useState(false);
  const [presetModalVisible, showPresetModal] = React.useState(false);

  const handleShowPresetModal = useCallback(() => {
    showPresetModal(true);
  }, []);

  const handleClosePresetModal = useCallback(() => {
    showPresetModal(false);
  }, []);

  const handleCloseExportModal = useCallback(() => {
    showExportModal(false);
  }, []);

  const handleSaveJSON = useCallback(() => {
    handleJSONUpdate(stringTokens);
  }, [handleJSONUpdate, stringTokens]);

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
          <Stack
            direction="row"
            gap={2}
            justify="between"
            align="center"
            css={{
              padding: '$3',
            }}
          >
            <Stack direction="row" gap={1}>
              <Button variant="ghost" disabled={editProhibited} onClick={handleShowPresetModal}>
                Tools
              </Button>
              <StylesDropdown />
            </Stack>
            <Stack direction="row" gap={1}>
              <ApplySelector />
              <SettingsDropdown />
            </Stack>
          </Stack>
        )}
      {exportModalVisible && <ExportModal onClose={handleCloseExportModal} />}
      {presetModalVisible && <PresetModal onClose={handleClosePresetModal} />}
    </Box>
  );
}

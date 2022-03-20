import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { track } from '@/utils/analytics';
import { Dispatch, RootState } from '../store';
import useTokens from '../store/useTokens';
import ApplySelector from './ApplySelector';
import { UpdateMode } from '@/types/state';
import Button from './Button';
import useConfirm from '../hooks/useConfirm';
import ExportModal from './modals/ExportModal';
import PresetModal from './modals/PresetModal';
import Box from './Box';
import ActionButton from './ActionButton';

export default function TokensBottomBar() {
  const { updateDocument } = useDispatch<Dispatch>().tokenState;
  const { editProhibited } = useSelector((state: RootState) => state.tokenState);
  const { updateMode = UpdateMode.PAGE } = useSelector((state: RootState) => state.settings);
  const {
    confirm,
  } = useConfirm();
  const shouldConfirm = React.useMemo(() => updateMode === UpdateMode.DOCUMENT, [updateMode]);

  const handleClearTokens = async () => {
    track('Clear Tokens');

    const userConfirmation = await confirm({
      text: 'Delete all tokens',
      description: 'Are you sure you want to delete all tokens?',
    });
    if (userConfirmation) {
      dispatch.tokenState.setEmptyTokens();
    }
  };

  const handleUpdate = React.useCallback(async () => {
    track('Update Tokens');
    if (shouldConfirm) {
      confirm({
        text: 'Are you sure?',
        description: 'You are about to run a document wide update. This operation can take more than 30 minutes on very large documents.',
      }).then(({ result }) => {
        if (result) {
          updateDocument();
        }
      });
    } else {
      updateDocument();
    }
  }, [confirm, shouldConfirm]);
  const { pullStyles } = useTokens();
  const { createStylesFromTokens } = useTokens();
  const [exportModalVisible, showExportModal] = React.useState(false);
  const [presetModalVisible, showPresetModal] = React.useState(false);

  return (
    <Box css={{
      width: '100%', backgroundColor: '$bgDefault', borderBottom: '1px solid', borderColor: '$borderMuted',
    }}
    >
      <Box css={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', gap: '$2', padding: '$3 $4',
      }}
      >
        <ApplySelector />
        <Box css={{ display: 'flex', flexDirection: 'row', gap: '$1' }}>
          <ActionButton text="Load" disabled={editProhibited} onClick={() => showPresetModal(true)} />
          <ActionButton text="Export" onClick={() => showExportModal(true)} />
          <ActionButton text="Import styles" disabled={editProhibited} onClick={pullStyles} />
          <ActionButton text="Create styles" onClick={createStylesFromTokens} />
          <ActionButton text="Update" variant="primary" onClick={handleUpdate} />
        </Box>
      </Box>
      {exportModalVisible && <ExportModal onClose={() => showExportModal(false)} />}
      {presetModalVisible && <PresetModal onClose={() => showPresetModal(false)} />}

    </Box>
  );
}

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
      <div className="flex items-center justify-between p-2">
        <ApplySelector />
        <div className="space-x-2">
          <Button variant="secondary" onClick={pullStyles} disabled={editProhibited}>
            Import
          </Button>
          <Button variant="secondary" onClick={createStylesFromTokens}>
            Create Styles
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            Update
          </Button>
        </div>
      </div>
      {exportModalVisible && <ExportModal onClose={() => showExportModal(false)} />}
      {presetModalVisible && <PresetModal onClose={() => showPresetModal(false)} />}

    </Box>
  );
}

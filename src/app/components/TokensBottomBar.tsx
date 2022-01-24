import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { track } from '@/utils/analytics';
import { Dispatch, RootState } from '../store';
import useTokens from '../store/useTokens';
import ApplySelector from './ApplySelector';
import { UpdateMode } from '@/types/state';
import Button from './Button';
import useConfirm from '../hooks/useConfirm';

export default function TokensBottomBar() {
  const { updateDocument } = useDispatch<Dispatch>().tokenState;
  const { editProhibited } = useSelector((state: RootState) => state.tokenState);
  const { updateMode = UpdateMode.PAGE } = useSelector((state: RootState) => state.settings);
  const {
    confirm,
  } = useConfirm();
  const shouldConfirm = React.useMemo(() => updateMode === UpdateMode.DOCUMENT, [updateMode]);

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

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200">
      <div className="flex justify-between items-center p-2">
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
    </div>
  );
}

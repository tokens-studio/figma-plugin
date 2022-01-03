import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { track } from '@/utils/analytics';
import { Dispatch, RootState } from '../store';
import useTokens from '../store/useTokens';
import ApplySelector from './ApplySelector';
import { UpdateMode } from '@/types/state';
import Button from './Button';

export default function TokensBottomBar() {
  const { updateDocument } = useDispatch<Dispatch>().tokenState;
  const { editProhibited } = useSelector((state: RootState) => state.tokenState);
  const { updateMode = UpdateMode.PAGE } = useSelector((state: RootState) => state.settings);
  const [confirmTimeout, setConfirmTimeout] = React.useState(0);
  const shouldConfirmAction = React.useMemo(() => updateMode === UpdateMode.DOCUMENT, [updateMode]);

  const handleUpdate = React.useCallback(async () => {
    track('Update Tokens');
    if (!shouldConfirmAction || confirmTimeout) {
      setConfirmTimeout(0);
      updateDocument();
    } else if (shouldConfirmAction) {
      setConfirmTimeout(5);
    }
  }, [confirmTimeout, shouldConfirmAction]);
  const { pullStyles } = useTokens();
  const { createStylesFromTokens } = useTokens();

  React.useEffect(() => {
    if (confirmTimeout) {
      const id = setTimeout(() => setConfirmTimeout(confirmTimeout - 1), 1000);
      return () => clearTimeout(id);
    }
  }, [confirmTimeout]);

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
            {confirmTimeout ? 'Confirm' : 'Update'}
          </Button>
        </div>
      </div>
      {!!confirmTimeout && (
        <div className="p-2 rounded-sm">
          Are you sure you want to run this action document wide? This operation can take more than 30 minutes on very large documents
        </div>
      )}
    </div>
  );
}

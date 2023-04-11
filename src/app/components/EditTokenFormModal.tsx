import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import { Dispatch } from '../store';
import EditTokenForm from './EditTokenForm';
import Modal from './Modal';
import { editTokenSelector } from '@/selectors';
import { EditTokenFormStatus } from '@/constants/EditTokenFormStatus';
import { showAutoSuggestSelector } from '@/selectors/showAutoSuggestSelector';

type Props = {
  resolvedTokens: ResolveTokenValuesResult[];
};

const EditTokenFormModal: React.FC<Props> = ({ resolvedTokens }) => {
  const editToken = useSelector(editTokenSelector);
  const showAutoSuggest = useSelector(showAutoSuggestSelector);
  const dispatch = useDispatch<Dispatch>();

  const handleReset = React.useCallback(() => {
    if (!showAutoSuggest) {
      dispatch.uiState.setShowEditForm(false);
    }
  }, [dispatch, showAutoSuggest]);

  if (!editToken) {
    return null;
  }

  return (
    <Modal
      compact
      large
      isOpen
      close={handleReset}
      // eslint-disable-next-line no-nested-ternary
      title={editToken.status === EditTokenFormStatus.CREATE ? 'New Token'
        : editToken.status === EditTokenFormStatus.DUPLICATE ? 'Duplicate Token' : editToken.initialName}
    >
      <EditTokenForm resolvedTokens={resolvedTokens} />
    </Modal>
  );
};

export default EditTokenFormModal;

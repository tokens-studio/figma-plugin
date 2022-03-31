import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import { Dispatch, RootState } from '../store';
import EditTokenForm from './EditTokenForm';
import Modal from './Modal';

type Props = {
  resolvedTokens: ResolveTokenValuesResult[];
};

function EditTokenFormModal({ resolvedTokens }: Props) {
  const { editToken } = useSelector((state: RootState) => state.uiState);
  const dispatch = useDispatch<Dispatch>();

  const handleReset = React.useCallback(() => {
    dispatch.uiState.setShowEditForm(false);
  }, [dispatch]);

  if (!editToken) {
    return null;
  }

  return (
    <Modal
      compact
      large
      isOpen
      close={handleReset}
      title={editToken.isPristine ? 'New Token' : editToken.initialName}
    >
      <EditTokenForm resolvedTokens={resolvedTokens} />
    </Modal>
  );
}

export default EditTokenFormModal;

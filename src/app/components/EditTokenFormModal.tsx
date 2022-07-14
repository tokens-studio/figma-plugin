import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import { Dispatch } from '../store';
import EditTokenForm from './EditTokenForm';
import Modal from './Modal';
import { editTokenSelector } from '@/selectors';

type Props = {
  resolvedTokens: ResolveTokenValuesResult[];
};

const EditTokenFormModal: React.FC<Props> = ({ resolvedTokens }) => {
  const editToken = useSelector(editTokenSelector);
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
      title={editToken.isPristine === 'create' ? 'New Token' : editToken.initialName}
    >
      <EditTokenForm resolvedTokens={resolvedTokens} />
    </Modal>
  );
};

export default EditTokenFormModal;

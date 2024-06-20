import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ResolveTokenValuesResult } from '@/utils/tokenHelpers';
import { Dispatch } from '../store';
import EditTokenForm from './EditTokenForm';
import Modal from './Modal';
import { editTokenSelector } from '@/selectors';
import { EditTokenFormStatus } from '@/constants/EditTokenFormStatus';
import { showAutoSuggestSelector } from '@/selectors/showAutoSuggestSelector';

type Props = {
  resolvedTokens: ResolveTokenValuesResult[];
};

const EditTokenFormModal: React.FC<React.PropsWithChildren<React.PropsWithChildren<Props>>> = ({ resolvedTokens }) => {
  const editToken = useSelector(editTokenSelector);
  const showAutoSuggest = useSelector(showAutoSuggestSelector);
  const dispatch = useDispatch<Dispatch>();

  const { t } = useTranslation(['tokens']);

  const handleReset = React.useCallback(() => {
    if (!showAutoSuggest) {
      dispatch.uiState.setShowEditForm(false);
    }
  }, [dispatch, showAutoSuggest]);

  const handleEditTokenModalClose = React.useCallback(() => {
    /**
     * Temporary fix - Radix UI leaves `pointer-events: none` on body when dialog is closed
     * Future fix - upgrade the Dialog in our DS (https://github.com/tokens-studio/ds/issues/219)
     * */
    setTimeout(() => {
      document.body.style.pointerEvents = 'auto';
    }, 1000);
  }, []);

  if (!editToken) {
    return null;
  }

  return (
    <Modal
      compact
      size="large"
      isOpen
      close={handleReset}
      onCloseCallback={handleEditTokenModalClose}
      // eslint-disable-next-line no-nested-ternary
      title={editToken.status === EditTokenFormStatus.CREATE ? t('newToken')
        : editToken.status === EditTokenFormStatus.DUPLICATE ? t('duplicateToken') : editToken.initialName}
    >
      <EditTokenForm resolvedTokens={resolvedTokens} />
    </Modal>
  );
};

export default EditTokenFormModal;

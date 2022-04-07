import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { activeThemeSelector, themesListSelector } from '@/selectors';
import Modal from '../Modal';
import { Dispatch } from '@/app/store';

type Props = {
};

export const ManageThemesModal: React.FC<Props> = () => {
  const dispatch = useDispatch<Dispatch>();
  const themes = useSelector(themesListSelector);
  const activeTheme = useSelector(activeThemeSelector);

  const handleClose = useCallback(() => {
    dispatch.uiState.setManageThemesModalOpen(false);
  }, [dispatch]);

  return (
    <Modal
      isOpen
      title="Themes"
      close={handleClose}
    >
      Hello world
    </Modal>
  );
};

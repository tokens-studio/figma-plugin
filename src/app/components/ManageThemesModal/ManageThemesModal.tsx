import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { activeThemeSelector, themesListSelector } from '@/selectors';
import Modal from '../Modal';
import { Dispatch } from '@/app/store';
import { EmptyState } from '../EmptyState';
import Stack from '../Stack';
import IconPlus from '@/icons/plus.svg';
import Button from '../Button';

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
      footer={(
        <Stack direction="row" justify="end">
          <Button
            data-cy="button-manage-themes-modal-new-theme"
            variant="secondary"
            icon={<IconPlus />}
          >
            New theme
          </Button>
        </Stack>
      )}
      close={handleClose}
    >
      {!themes.length && (
        <EmptyState
          title="You don't have any themes yet"
          subtitle="Create your first theme now"
        />
      )}
    </Modal>
  );
};

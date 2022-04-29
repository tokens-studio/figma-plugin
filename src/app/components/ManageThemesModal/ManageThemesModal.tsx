import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { activeThemeSelector, themesListSelector } from '@/selectors';
import Modal from '../Modal';
import { Dispatch } from '@/app/store';
import Blankslate from '../Blankslate';
import Stack from '../Stack';
import IconPlus from '@/icons/plus.svg';
import Button from '../Button';
import { CreateOrEditThemeForm, FormValues } from './CreateOrEditThemeForm';
import { SingleThemeEntry } from './SingleThemeEntry';
import { ThemeObject } from '@/types';
import Box from '../Box';

type Props = {
};

export const ManageThemesModal: React.FC<Props> = () => {
  const dispatch = useDispatch<Dispatch>();
  const themes = useSelector(themesListSelector);
  const activeTheme = useSelector(activeThemeSelector);
  const [themeEditorOpen, setThemeEditorOpen] = useState<boolean | string>(false);
  const themeEditorDefaultValues = useMemo(() => {
    const themeObject = themes.find(({ id }) => id === themeEditorOpen);
    if (themeObject) {
      return {
        name: themeObject.name,
        tokenSets: themeObject.selectedTokenSets,
      };
    }
    return {};
  }, [themes, themeEditorOpen]);

  const handleClose = useCallback(() => {
    dispatch.uiState.setManageThemesModalOpen(false);
  }, [dispatch]);

  const handleToggleThemeEditor = useCallback((theme?: ThemeObject) => {
    if (theme && typeof theme !== 'boolean') {
      const nextState = theme.id === themeEditorOpen ? false : theme.id;
      setThemeEditorOpen(nextState);
    } else {
      setThemeEditorOpen(!themeEditorOpen);
    }
  }, [themeEditorOpen]);

  const handleDeleteTheme = useCallback(() => {
    if (typeof themeEditorOpen === 'string') {
      dispatch.tokenState.deleteTheme(themeEditorOpen);
      setThemeEditorOpen(false);
    }
  }, [dispatch, themeEditorOpen]);

  const handleSubmit = useCallback((values: FormValues) => {
    dispatch.tokenState.saveTheme({
      id: typeof themeEditorOpen === 'string' ? themeEditorOpen : undefined,
      name: values.name,
      selectedTokenSets: values.tokenSets,
    });
    setThemeEditorOpen(false);
  }, [themeEditorOpen, dispatch]);

  return (
    <Modal
      isOpen
      compact
      large
      title="Themes"
      footer={(
        <Stack gap={2} direction="row" justify="end">
          {!themeEditorOpen && (
            <Button
              data-cy="button-manage-themes-modal-new-theme"
              variant="secondary"
              icon={<IconPlus />}
              onClick={handleToggleThemeEditor}
            >
              New theme
            </Button>
          )}
          {themeEditorOpen && (
            <>
              <Box css={{ marginRight: 'auto' }}>
                <Button
                  data-cy="button-manage-themes-modal-cancel"
                  variant="secondary"
                  onClick={handleToggleThemeEditor}
                >
                  Cancel
                </Button>
              </Box>
              {typeof themeEditorOpen === 'string' && (
                <Button
                  data-cy="button-manage-themes-modal-delete-theme"
                  variant="secondary"
                  type="submit"
                  onClick={handleDeleteTheme}
                >
                  Delete
                </Button>
              )}
              <Button
                data-cy="button-manage-themes-modal-save-theme"
                variant="primary"
                type="submit"
                form="form-create-or-edit-theme"
              >
                Save theme
              </Button>
            </>
          )}
        </Stack>
      )}
      close={handleClose}
    >
      {!themes.length && !themeEditorOpen && (
        <Blankslate
          css={{ padding: '$8 $4' }}
          title="You don't have any themes yet"
          text="Create your first theme now"
        />
      )}
      {!!themes.length && !themeEditorOpen && (
        themes.map((theme) => (
          <SingleThemeEntry
            key={theme.id}
            theme={theme}
            isActive={activeTheme === theme.id}
            onOpen={handleToggleThemeEditor}
          />
        ))
      )}
      {themeEditorOpen && (
        <CreateOrEditThemeForm
          id={typeof themeEditorOpen === 'string' ? themeEditorOpen : undefined}
          defaultValues={themeEditorDefaultValues}
          onSubmit={handleSubmit}
        />
      )}
    </Modal>
  );
};

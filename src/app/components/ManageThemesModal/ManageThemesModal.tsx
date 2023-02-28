import React, {
  useCallback, useMemo, useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import compact from 'just-compact';
import { activeThemeSelector, themesListSelector } from '@/selectors';
import Modal from '../Modal';
import { Dispatch } from '@/app/store';
import Blankslate from '../Blankslate';
import Stack from '../Stack';
import IconPlus from '@/icons/plus.svg';
import Button from '../Button';
import { CreateOrEditThemeForm, FormValues } from './CreateOrEditThemeForm';
import { ThemeObject, ThemeObjectsList } from '@/types';
import Box from '../Box';
import { track } from '@/utils/analytics';
import useConfirm from '@/app/hooks/useConfirm';
import { ReorderGroup } from '@/motion/ReorderGroup';
import { DragItem } from '../StyledDragger/DragItem';
import { ThemeListItemContent } from '../ThemeSelector/ThemeListItemContent';

type Props = unknown;

export const ManageThemesModal: React.FC<Props> = () => {
  const dispatch = useDispatch<Dispatch>();
  const themes = useSelector(themesListSelector);
  const activeTheme = useSelector(activeThemeSelector);
  const { confirm } = useConfirm();
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

  const handleDeleteTheme = useCallback(async () => {
    if (typeof themeEditorOpen === 'string') {
      const confirmDelete = await confirm({ text: 'Are you sure you want to delete this theme?' });
      if (confirmDelete) {
        track('Delete theme', { id: themeEditorOpen });
        dispatch.tokenState.deleteTheme(themeEditorOpen);
        setThemeEditorOpen(false);
      }
    }
  }, [confirm, dispatch.tokenState, themeEditorOpen]);

  const handleCancelEdit = useCallback(() => {
    setThemeEditorOpen(false);
  }, []);

  const handleSubmit = useCallback((values: FormValues) => {
    const id = typeof themeEditorOpen === 'string' ? themeEditorOpen : undefined;
    if (id) {
      track('Edit theme', { id, values });
    } else {
      track('Create theme', { values });
    }
    dispatch.tokenState.saveTheme({
      id,
      name: values.name,
      selectedTokenSets: values.tokenSets,
    });
    setThemeEditorOpen(false);
  }, [themeEditorOpen, dispatch]);

  const handleReorder = React.useCallback((reorderedItems: ThemeObjectsList) => {
    const reorderedThemeList = compact(reorderedItems.map((item) => themes.find((theme) => theme.id === item.id)));
    dispatch.tokenState.setThemes(reorderedThemeList);
  }, [dispatch.tokenState, themes]);

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
              id="button-manage-themes-modal-new-theme"
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
                {typeof themeEditorOpen === 'string' && (
                <Button
                  id="button-manage-themes-modal-delete-theme"
                  variant="danger"
                  type="submit"
                  onClick={handleDeleteTheme}
                >
                  Delete
                </Button>
                )}
              </Box>
              <Button
                id="button-manage-themes-modal-cancel"
                variant="secondary"
                onClick={handleToggleThemeEditor}
              >
                Cancel
              </Button>
              <Button
                id="button-manage-themes-modal-save-theme"
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
      <ReorderGroup
        layoutScroll
        values={themes}
        onReorder={handleReorder}
      >
        {themes.map((theme) => (
          <DragItem<ThemeObject> key={theme.id} item={theme}>
            <ThemeListItemContent item={theme} isActive={activeTheme === theme.id} onOpen={handleToggleThemeEditor} />
          </DragItem>
        ))}
      </ReorderGroup>
      )}
      {themeEditorOpen && (
        <CreateOrEditThemeForm
          id={typeof themeEditorOpen === 'string' ? themeEditorOpen : undefined}
          defaultValues={themeEditorDefaultValues}
          onSubmit={handleSubmit}
          onCancel={handleCancelEdit}
        />
      )}
    </Modal>
  );
};

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
import { ThemeObject } from '@/types';
import Box from '../Box';
import { track } from '@/utils/analytics';
import useConfirm from '@/app/hooks/useConfirm';
import { ThemeListItemContent } from '../ThemeSelector/ThemeListItemContent';
import Text from '../Text';

type Props = unknown;

export const ManageThemesModal: React.FC<Props> = () => {
  const dispatch = useDispatch<Dispatch>();
  const themes = useSelector(themesListSelector);
  const activeTheme = useSelector(activeThemeSelector);
  const { confirm } = useConfirm();
  const [themeEditorOpen, setThemeEditorOpen] = useState<boolean | string>(false);
  const groupNames = useMemo(() => compact(themes.map((theme) => theme.group)), [themes]);

  const themeEditorDefaultValues = useMemo(() => {
    const themeObject = themes.find(({ id }) => id === themeEditorOpen);
    if (themeObject) {
      return {
        name: themeObject.name,
        group: themeObject.group,
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
      group: values.group,
      selectedTokenSets: values.tokenSets,
    });
    setThemeEditorOpen(false);
  }, [themeEditorOpen, dispatch]);

  return (
    <Modal
      isOpen
      compact={!!themeEditorOpen}
      full={!themeEditorOpen}
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
        <>
          {
            themes.filter((t) => (typeof t.group === 'undefined')).length > 0 && (
              <>
                <Text css={{ color: '$textSubtle', padding: '$2 $3' }}>No Group</Text>
                {
                  themes.filter((t) => (typeof t.group === 'undefined')).map((theme) => (
                    <ThemeListItemContent item={theme} isActive={activeTheme?.noGroup === theme.id} onOpen={handleToggleThemeEditor} groupName="noGroup" />
                  ))
                }
              </>
            )
          }
          {
            groupNames.map((groupName) => {
              const filteredThemes = themes.filter((t) => (t.group === groupName));
              return (
                filteredThemes.length > 0 && (
                  <>
                    <Text css={{ color: '$textSubtle', padding: '$2 $3' }}>{groupName}</Text>
                    {
                      filteredThemes.map((theme) => (
                        <ThemeListItemContent item={theme} isActive={activeTheme[groupName] === theme.id} onOpen={handleToggleThemeEditor} groupName={groupName} />
                      ))
                    }
                  </>
                )
              );
            })
          }
        </>
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

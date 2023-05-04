import React, {
  useCallback, useMemo, useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import { ThemeListItemContent } from './ThemeListItemContent';
import { DragItem } from '../StyledDragger/DragItem';
import { ReorderGroup } from '@/motion/ReorderGroup';
import { ThemeListGroupHeader } from './ThemeListGroupHeader';
import { INTERNAL_THEMES_NO_GROUP, INTERNAL_THEMES_NO_GROUP_LABEL } from '@/constants/InternalTokenGroup';

type Props = unknown;

export const ManageThemesModal: React.FC<Props> = () => {
  const dispatch = useDispatch<Dispatch>();
  const themes = useSelector(themesListSelector);
  const activeTheme = useSelector(activeThemeSelector);
  const { confirm } = useConfirm();
  const [themeEditorOpen, setThemeEditorOpen] = useState<boolean | string>(false);
  const groupNames = useMemo(() => {
    const newArray: string[] = [];
    themes.forEach((theme) => {
      if ((theme?.group !== undefined && !newArray.includes(theme?.group)) || (theme?.group === undefined && !newArray.includes(INTERNAL_THEMES_NO_GROUP))) {
        newArray.push(theme?.group ?? INTERNAL_THEMES_NO_GROUP);
      }
    });
    return newArray;
  }, [themes]);

  const themeEditorDefaultValues = useMemo(() => {
    const themeObject = themes.find(({ id }) => id === themeEditorOpen);
    if (themeObject) {
      return {
        name: themeObject.name,
        tokenSets: themeObject.selectedTokenSets,
        ...(themeObject?.group ? { group: themeObject.group } : {}),
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
      ...(values?.group ? { group: values.group } : {}),
    });
    setThemeEditorOpen(false);
  }, [themeEditorOpen, dispatch]);

  const handleReorder = React.useCallback((reorderedItems: ThemeObjectsList) => {
    const reorderedThemeList = [...themes];
    reorderedThemeList.forEach((theme, index) => {
      if (theme?.group === reorderedItems[0]?.group) {
        reorderedThemeList.splice(index, 1, reorderedItems.shift() || theme);
      }
    });
    dispatch.tokenState.setThemes(reorderedThemeList);
  }, [dispatch.tokenState, themes]);

  const handleGroupReorder = React.useCallback((reorderedItems: string[]) => {
    const reorderedThemeList = themes.sort((a, b) => reorderedItems.indexOf(a?.group ?? INTERNAL_THEMES_NO_GROUP) - reorderedItems.indexOf(b?.group ?? INTERNAL_THEMES_NO_GROUP));
    dispatch.tokenState.setThemes(reorderedThemeList);
  }, [dispatch.tokenState, themes]);
  return (
    <Modal
      isOpen
      full
      large
      title="Themes"
      stickyFooter
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
        <Box css={{ padding: '$3' }}>
          <ReorderGroup
            layoutScroll
            values={groupNames}
            onReorder={handleGroupReorder}
          >
            {
            groupNames.map((groupName) => {
              const filteredThemes = groupName === INTERNAL_THEMES_NO_GROUP ? themes.filter((t) => (typeof t?.group === 'undefined')) : themes.filter((t) => (t?.group === groupName));
              return (
                filteredThemes.length > 0 && (
                <DragItem<string> key={groupName} item={groupName}>
                  <ThemeListGroupHeader groupName={groupName === INTERNAL_THEMES_NO_GROUP ? INTERNAL_THEMES_NO_GROUP_LABEL : groupName} item={groupName} />
                  <ReorderGroup
                    layoutScroll
                    values={filteredThemes}
                    onReorder={handleReorder}
                  >
                    {filteredThemes.map((theme) => (
                      <DragItem<ThemeObject> key={theme.id} item={theme}>
                        <ThemeListItemContent item={theme} isActive={activeTheme?.[groupName] === theme.id} onOpen={handleToggleThemeEditor} groupName={groupName} />
                      </DragItem>
                    ))}
                  </ReorderGroup>
                </DragItem>
                )
              );
            })
          }
          </ReorderGroup>
        </Box>
      )}
      {themeEditorOpen && (
        <Box css={{ padding: '$4 $3' }}>
          <CreateOrEditThemeForm
            id={typeof themeEditorOpen === 'string' ? themeEditorOpen : undefined}
            defaultValues={themeEditorDefaultValues}
            onSubmit={handleSubmit}
            onCancel={handleCancelEdit}
          />
        </Box>
      )}
    </Modal>
  );
};

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
import { TreeItem, themeListToTree } from '@/utils/themeListToTree';
import { ItemData } from '@/context';
import { checkReorder } from '@/utils/motion';
import { ensureFolderIsTogether, findOrderableTargetIndexesInThemeList } from '@/utils/dragDropOrder';

type Props = unknown;

export const ManageThemesModal: React.FC<Props> = () => {
  const dispatch = useDispatch<Dispatch>();
  const themes = useSelector(themesListSelector);
  const activeTheme = useSelector(activeThemeSelector);
  const { confirm } = useConfirm();
  const [themeEditorOpen, setThemeEditorOpen] = useState<boolean | string>(false);
  const [IsThemeGroupNameEditing, setIsThemeGroupNameEditing] = useState(false);
  const treeItems = themeListToTree(themes);

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
    if (!IsThemeGroupNameEditing) {
      dispatch.uiState.setManageThemesModalOpen(false);
    }
  }, [IsThemeGroupNameEditing, dispatch]);

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

  const handleReorder = React.useCallback((reorderedItems: TreeItem[]) => {
    let currentGroup = '';
    const updatedThemes = reorderedItems.reduce<ThemeObjectsList>((acc, curr) => {
      if (!curr.isLeaf && typeof curr.value === 'string') {
        currentGroup = curr.value;
      }
      if (curr.isLeaf && typeof curr.value === 'object') {
        acc.push({
          ...curr.value,
          group: currentGroup,
        });
      }
      return acc;
    }, []);
    const newActiveTheme = activeTheme;
    Object.keys(newActiveTheme).forEach((group) => {
      // check whether the activeTheme is still belong to the group
      if (updatedThemes.findIndex((theme) => theme.id === activeTheme?.[group] && theme.group === group) < 0) {
        delete newActiveTheme[group];
      }
    });
    dispatch.tokenState.setThemes(updatedThemes);
  }, [dispatch.tokenState, activeTheme]);

  const handleCheckReorder = React.useCallback((
    order: ItemData<typeof treeItems[number]>[],
    value: typeof treeItems[number],
    offset: number,
    velocity: number,
  ) => {
    const availableIndexes = findOrderableTargetIndexesInThemeList(
      value,
      order,
    );
    let nextOrder = checkReorder(order, value, offset, velocity, availableIndexes);
    // ensure folders stay together
    if (!value.isLeaf) {
      nextOrder = ensureFolderIsTogether<TreeItem>(value, order, nextOrder);
    }
    return nextOrder;
  }, []);

  const handleUpdateIsEditing = React.useCallback((editing: boolean) => {
    setIsThemeGroupNameEditing(editing);
  }, []);

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
        <Box css={{ padding: '$3 $2 $3 0' }}>
          <ReorderGroup
            layoutScroll
            values={treeItems}
            onReorder={handleReorder}
            checkReorder={handleCheckReorder}
          >
            {
            treeItems.map((item) => (
              <DragItem<TreeItem> key={item.key} item={item}>
                {
                  item.isLeaf && typeof item.value === 'object' ? (
                    <ThemeListItemContent item={item.value} isActive={activeTheme?.[item.parent as string] === item.value.id} onOpen={handleToggleThemeEditor} groupName={item.parent as string} />
                  ) : (
                    <ThemeListGroupHeader
                      label={item.value === INTERNAL_THEMES_NO_GROUP ? INTERNAL_THEMES_NO_GROUP_LABEL : item.value as string}
                      groupName={item.value as string}
                      setIsGroupEditing={handleUpdateIsEditing}
                    />
                  )
                }
              </DragItem>
            ))
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

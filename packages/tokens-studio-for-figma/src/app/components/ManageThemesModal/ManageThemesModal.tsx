import React, {
  useCallback, useMemo, useState, useRef, useEffect,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import omit from 'just-omit';
import debounce from 'lodash.debounce';
import { Button, EmptyState } from '@tokens-studio/ui';
import { styled } from '@stitches/react';
import { useTranslation } from 'react-i18next';
import { activeThemeSelector, themesListSelector } from '@/selectors';
import Modal from '../Modal';
import { Dispatch } from '@/app/store';
import Stack from '../Stack';
import IconPlus from '@/icons/plus.svg';
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

const StyledReorderGroup = styled(ReorderGroup, {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gridAutoFlow: 'row',
  '> li > button': {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr min-content',
    gridAutoFlow: 'column',
  },
});

export const ManageThemesModal: React.FC<React.PropsWithChildren<React.PropsWithChildren<Props>>> = () => {
  const dispatch = useDispatch<Dispatch>();
  const themes = useSelector(themesListSelector);
  const activeTheme = useSelector(activeThemeSelector);
  const { confirm } = useConfirm();
  const [themeEditorOpen, setThemeEditorOpen] = useState<boolean | string>(false);
  const [themeListScrollPosition, setThemeListScrollPosition] = useState<number>(0);
  const themeListRef = useRef<HTMLDivElement>(null);
  const treeItems = themeListToTree(themes);
  const { t } = useTranslation(['tokens']);

  const themeEditorDefaultValues: Partial<ThemeObject> = useMemo(() => {
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
      if (nextState) {
        if (themeListRef.current) {
          setThemeListScrollPosition(themeListRef.current.scrollTop);
        }
      }
      setThemeEditorOpen(nextState);
    } else {
      setThemeEditorOpen(!themeEditorOpen);
    }
  }, [themeEditorOpen]);

  const handleToggleOpenThemeEditor = useCallback(() => {
    setThemeEditorOpen(!themeEditorOpen);
  }, [themeEditorOpen]);

  const handleDeleteTheme = useCallback(async () => {
    if (typeof themeEditorOpen === 'string') {
      const confirmDelete = await confirm({ text: t('confirmDeleteTheme'), confirmAction: t('delete'), variant: 'danger' });
      if (confirmDelete) {
        track('Delete theme', { id: themeEditorOpen });
        dispatch.tokenState.deleteTheme(themeEditorOpen);
        setThemeEditorOpen(false);
      }
    }
  }, [confirm, dispatch.tokenState, t, themeEditorOpen]);

  const handleCancelEdit = useCallback(() => {
    setThemeEditorOpen(false);
  }, []);

  const handleEscapeKeyDown = useCallback((event: KeyboardEvent) => {
    // If we're inside a theme editor, prevent closing the modal and go back to theme list
    if (themeEditorOpen) {
      event.preventDefault();
      setThemeEditorOpen(false);
    }
    // If themeEditorOpen is false, let default behavior close the modal
  }, [themeEditorOpen]);

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
      meta: {
        oldName: themeEditorDefaultValues?.name,
        oldGroup: themeEditorDefaultValues?.group,
      },
    });
    setThemeEditorOpen(false);
  }, [themeEditorOpen, dispatch.tokenState, themeEditorDefaultValues]);

  const handleReorder = React.useCallback((reorderedItems: TreeItem[]) => {
    let currentGroup = '';
    const updatedThemes = reorderedItems.reduce<ThemeObjectsList>((acc, curr) => {
      if (!curr.isLeaf && typeof curr.value === 'string') {
        currentGroup = curr.value;
      }
      if (curr.isLeaf && typeof curr.value === 'object') {
        acc.push({
          ...omit(curr.value, 'group'),
          ...(currentGroup === INTERNAL_THEMES_NO_GROUP ? {} : { group: currentGroup }),
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
    dispatch.tokenState.replaceThemes(updatedThemes);
  }, [dispatch.tokenState, activeTheme]);

  const handleCheckReorder = React.useCallback((
    order: ItemData<typeof treeItems[number]>[],
    value: typeof treeItems[number],
    offset: number,
    velocity: number,
  ) => {
    const availableIndexes = findOrderableTargetIndexesInThemeList(
      velocity,
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

  useEffect(() => {
    if (themeListRef.current) {
      themeListRef.current.scrollTop = themeListScrollPosition;
    }
  }, [themeEditorOpen, themeListScrollPosition]);

  const handleThemeListScroll = useCallback(() => {
    if (themeListRef.current) {
      setThemeListScrollPosition(themeListRef.current.scrollTop);
    }
  }, []);

  const debouncedHandleThemeListScroll = useMemo(() => debounce(handleThemeListScroll, 200), [handleThemeListScroll]);

  return (
    <Modal
      id="manage-themes-modal"
      isOpen
      full
      title={t('themes')}
      stickyFooter
      showClose
      footer={(
        <Stack gap={2} direction="row" justify="end">
          {!themeEditorOpen && (
            <Button
              data-testid="button-manage-themes-modal-new-theme"
              variant="secondary"
              icon={<IconPlus />}
              onClick={handleToggleOpenThemeEditor}
            >
              {t('newTheme')}
            </Button>
          )}
          {themeEditorOpen && (
            <>
              <Box css={{ marginRight: 'auto' }}>
                {typeof themeEditorOpen === 'string' && (
                <Button
                  data-testid="button-manage-themes-modal-delete-theme"
                  variant="danger"
                  type="submit"
                  onClick={handleDeleteTheme}
                >
                  {t('delete')}
                </Button>
                )}
              </Box>
              <Stack direction="row" gap={4}>
                <Button
                  data-testid="button-manage-themes-modal-cancel"
                  variant="secondary"
                  onClick={handleToggleOpenThemeEditor}
                >
                  {t('cancel')}
                </Button>
                <Button
                  data-testid="button-manage-themes-modal-save-theme"
                  variant="primary"
                  type="submit"
                  form="form-create-or-edit-theme"
                >
                  {t('saveTheme')}
                </Button>
              </Stack>
            </>
          )}
        </Stack>
      )}
      close={handleClose}
      onEscapeKeyDown={handleEscapeKeyDown}
      scrollContainerRef={themeListRef}
    >
      {!themes.length && !themeEditorOpen && (
        <EmptyState
          css={{ padding: '$8 $4' }}
          title={t('manageThemesModal.emptyTitle')}
          description={t('manageThemesModal.emptyDescription')}
        />
      )}
      {!!themes.length && !themeEditorOpen && (
        <Box
          css={{ padding: '$3 $2 $3 0' }}
          onScroll={debouncedHandleThemeListScroll}
        >
          <StyledReorderGroup
            layoutScroll
            values={treeItems}
            onReorder={handleReorder}
            checkReorder={handleCheckReorder as (order: ItemData<unknown>[], value: unknown, offset: number, velocity: number) => ItemData<unknown>[]}
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
                    />
                  )
                }
              </DragItem>
            ))
          }
          </StyledReorderGroup>
        </Box>
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

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
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { notifyToUI } from '@/plugin/notifiers';
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
import {
  getThemeDepth as getThemeHierarchyDepth,
  buildChildrenMap as buildThemeChildrenMap,
  collectDescendants as collectThemeDescendants,
} from '@/utils/themeHierarchy';
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
  const [isExtendMode, setIsExtendMode] = useState(false);
  const [selectedParentGroup, setSelectedParentGroup] = useState<string | undefined>(undefined);
  const [themeListScrollPosition, setThemeListScrollPosition] = useState<number>(0);
  const themeListRef = useRef<HTMLDivElement>(null);
  const treeItems = themeListToTree(themes);
  const { t } = useTranslation(['tokens']);

  const themesById = useMemo(() => new Map(themes.map((t) => [t.id, t])), [themes]);

  const getThemeDepth = useCallback((themeId: string) => getThemeHierarchyDepth(themeId, themesById), [themesById]);

  const getGroupDepth = useCallback((groupName: string) => {
    const firstThemeInGroup = themes.find((t) => t.group === groupName);
    if (firstThemeInGroup) {
      return getThemeDepth(firstThemeInGroup.id);
    }
    return 0;
  }, [themes, getThemeDepth]);

  const themeEditorDefaultValues: Partial<FormValues> = useMemo(() => {
    const themeObject = themes.find(({ id }) => id === themeEditorOpen);
    if (themeObject) {
      return {
        name: themeObject.name,
        tokenSets: themeObject.selectedTokenSets,
        ...(themeObject?.group ? { group: themeObject.group } : {}),
        $figmaMirrorParentSets: themeObject.$figmaMirrorParentSets,
      };
    }
    // If in extend mode, pre-populate parentThemeId with selected group
    if (isExtendMode && selectedParentGroup) {
      return {
        parentThemeId: selectedParentGroup,
      };
    }
    return {};
  }, [themes, themeEditorOpen, isExtendMode, selectedParentGroup]);

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
      // Deleting a theme cascades to its extension (child) themes — warn if any exist.
      const childCount = collectThemeDescendants(themeEditorOpen, buildThemeChildrenMap(themes)).length;
      const text = childCount > 0
        ? t('confirmDeleteThemeWithChildren', { count: childCount })
        : t('confirmDeleteTheme');
      const confirmDelete = await confirm({ text, confirmAction: t('delete'), variant: 'danger' });
      if (confirmDelete) {
        track('Delete theme', { id: themeEditorOpen });
        dispatch.tokenState.deleteTheme(themeEditorOpen);
        setThemeEditorOpen(false);
      }
    }
  }, [confirm, dispatch.tokenState, t, themeEditorOpen, themes]);

  const handleDeleteThemeGroup = useCallback(async (groupName: string) => {
    const themesInGroup = themes.filter((t) => t.group === groupName);
    // Count extension descendants that live outside this group and will also be removed.
    const childrenMap = buildThemeChildrenMap(themes);
    const groupThemeIds = new Set(themesInGroup.map((t) => t.id));
    const cascadedChildren = new Set<string>();
    themesInGroup.forEach((t) => {
      collectThemeDescendants(t.id, childrenMap).forEach((id) => {
        if (!groupThemeIds.has(id)) cascadedChildren.add(id);
      });
    });

    const confirmText = cascadedChildren.size > 0
      ? t('confirmDeleteThemeGroupWithChildren', { group: groupName, count: themesInGroup.length, childCount: cascadedChildren.size })
      : t('confirmDeleteThemeGroup', { group: groupName, count: themesInGroup.length });

    const confirmDelete = await confirm({
      text: confirmText,
      confirmAction: t('delete'),
      variant: 'danger',
    });

    if (confirmDelete) {
      track('Delete theme group', { groupName, themeCount: themesInGroup.length });
      dispatch.tokenState.deleteThemeGroup(groupName);
    }
  }, [themes, confirm, dispatch, t]);

  // Reset all theme-editor state. Must run on EVERY close/submit path, otherwise
  // stale extend-mode state leaks into the next "New Theme" and silently creates
  // another extension of the previously selected group.
  const closeThemeEditor = useCallback(() => {
    setThemeEditorOpen(false);
    setIsExtendMode(false);
    setSelectedParentGroup(undefined);
  }, []);

  const handleCancelEdit = useCallback(() => {
    closeThemeEditor();
  }, [closeThemeEditor]);

  const handleEscapeKeyDown = useCallback((event: KeyboardEvent) => {
    // If we're inside a theme editor, prevent closing the modal and go back to theme list
    if (themeEditorOpen) {
      event.preventDefault();
      closeThemeEditor();
    }
    // If themeEditorOpen is false, let default behavior close the modal
  }, [themeEditorOpen, closeThemeEditor]);

  const handleSubmit = useCallback((values: FormValues) => {
    const id = typeof themeEditorOpen === 'string' ? themeEditorOpen : undefined;

    if (id) {
      // EDITING EXISTING THEME
      track('Edit theme', { id, values });

      // If this is an extended theme with mirror enabled, use parent's token sets
      const currentTheme = themes.find((t) => t.id === id);
      const shouldMirror = values.$figmaMirrorParentSets ?? currentTheme?.$figmaMirrorParentSets ?? false;
      let tokenSetsToUse = values.tokenSets;

      if (shouldMirror && currentTheme?.$figmaParentThemeId) {
        const parentTheme = themes.find((t) => t.id === currentTheme.$figmaParentThemeId);
        if (parentTheme) {
          tokenSetsToUse = parentTheme.selectedTokenSets;
        }
      }

      dispatch.tokenState.saveTheme({
        id,
        name: values.name,
        selectedTokenSets: tokenSetsToUse,
        ...(values?.group ? { group: values.group } : {}),
        $figmaMirrorParentSets: values.$figmaMirrorParentSets,
        meta: {
          oldName: themeEditorDefaultValues?.name,
          oldGroup: themeEditorDefaultValues?.group,
        },
      });
      closeThemeEditor();
      return;
    }

    // CREATING NEW THEME(S)
    const parentGroupName = values.parentThemeId; // Group name to extend from

    // In extend mode a parent group is required, and the new extended group name
    // must not collide with an existing theme group.
    if (isExtendMode) {
      if (!parentGroupName) {
        notifyToUI(t('extendModeRequiresParentGroup'), { error: true });
        return;
      }
      if (values.name && themes.some((theme) => theme.group === values.name)) {
        notifyToUI(t('themeGroupNameCollision', { group: values.name }), { error: true });
        return;
      }
    }

    track('Create theme', { values });

    const parentThemes = parentGroupName
      ? themes.filter((t) => t.group === parentGroupName) // Include all themes in the parent group, even if already extended
      : [];

    if (parentThemes.length > 0) {
      // EXTENDING A GROUP: Create multiple themes (one for each mode in parent)
      const newGroupName = values.name;

      parentThemes.forEach((parentTheme) => {
        const themeData: any = {
          name: parentTheme.name, // Keep same mode name (Light, Dark, etc.)
          group: newGroupName, // Use user-provided name directly without auto-prefixing
          selectedTokenSets: parentTheme.selectedTokenSets, // Copy parent's token sets
          $figmaIsExtension: true,
          $figmaParentThemeId: parentTheme.id,
          $figmaParentCollectionId: parentTheme.$figmaCollectionId,
          $figmaMirrorParentSets: true, // Enable mirroring by default
        };

        dispatch.tokenState.saveTheme(themeData);
      });

      track('Extended theme group created', {
        parentGroup: parentGroupName,
        newGroup: newGroupName,
        themesCreated: parentThemes.length,
      });
    } else {
      // REGULAR THEME: Create single theme
      const themeData: any = {
        name: values.name,
        selectedTokenSets: values.tokenSets,
        ...(values?.group ? { group: values.group } : {}),
      };

      dispatch.tokenState.saveTheme(themeData);
    }

    closeThemeEditor();
  }, [themeEditorOpen, dispatch.tokenState, themeEditorDefaultValues, themes, isExtendMode, closeThemeEditor, t]);

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

    // Cascade parent theme order to child themes
    // Build a map of parent theme ID -> new index position
    const parentThemeOrderMap = new Map<string, number>();
    updatedThemes.forEach((theme, index) => {
      // Only track non-extended themes (parent themes)
      if (!theme.$figmaParentThemeId) {
        parentThemeOrderMap.set(theme.id, index);
      }
    });

    // Capture pre-sort indexes so the comparator doesn't read a mutating array
    const originalIndex = new Map(updatedThemes.map((t, i) => [t.id, i]));

    // Sort extended themes based on their parent's new order
    const finalThemes = updatedThemes.sort((a, b) => {
      const aIsExtended = !!a.$figmaParentThemeId;
      const bIsExtended = !!b.$figmaParentThemeId;

      // If neither is extended, keep original order
      if (!aIsExtended && !bIsExtended) {
        return (originalIndex.get(a.id) ?? 0) - (originalIndex.get(b.id) ?? 0);
      }

      // If only one is extended, prioritize parent themes first
      if (aIsExtended && !bIsExtended) {
        return 1;
      }
      if (!aIsExtended && bIsExtended) {
        return -1;
      }

      // Both are extended - sort by parent theme order
      const aParentOrder = parentThemeOrderMap.get(a.$figmaParentThemeId!) ?? Infinity;
      const bParentOrder = parentThemeOrderMap.get(b.$figmaParentThemeId!) ?? Infinity;

      if (aParentOrder !== bParentOrder) {
        return aParentOrder - bParentOrder;
      }

      // Same parent order, maintain original relative order
      return (originalIndex.get(a.id) ?? 0) - (originalIndex.get(b.id) ?? 0);
    });

    const newActiveTheme = activeTheme;
    Object.keys(newActiveTheme).forEach((group) => {
      // check whether the activeTheme is still belong to the group
      if (finalThemes.findIndex((theme) => theme.id === activeTheme?.[group] && theme.group === group) < 0) {
        delete newActiveTheme[group];
      }
    });
    dispatch.tokenState.replaceThemes(finalThemes);
  }, [dispatch.tokenState, activeTheme]);

  // Helper to check if a theme group is extended (child theme)
  const isExtendedGroup = useCallback((groupName: string) => {
    // Check if group name contains "/" (hierarchical format like "Parent/Extended")
    if (groupName.includes('/')) {
      return true;
    }
    // Also check if any theme in this group has $figmaParentThemeId
    const themesInGroup = themes.filter((t) => t.group === groupName);
    return themesInGroup.some((t) => t.$figmaParentThemeId);
  }, [themes]);

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

  useEffect(() => {
    AsyncMessageChannel.ReactInstance.message({ type: AsyncMessageTypes.CHECK_FIGMA_ENTERPRISE })
      .then((result) => {
        dispatch.userState.setIsFigmaEnterprise(result.isFigmaEnterprise);
      })
      .catch(() => {
        dispatch.userState.setIsFigmaEnterprise(false);
      });
  }, [dispatch.userState]);

  const handleThemeListScroll = useCallback(() => {
    if (themeListRef.current) {
      setThemeListScrollPosition(themeListRef.current.scrollTop);
    }
  }, []);

  const debouncedHandleThemeListScroll = useMemo(() => debounce(handleThemeListScroll, 200), [handleThemeListScroll]);

  const handleExtendThemeGroup = useCallback((groupName: string) => {
    setSelectedParentGroup(groupName);
    setIsExtendMode(true);
    setThemeEditorOpen(true);
  }, [setSelectedParentGroup, setIsExtendMode, setThemeEditorOpen]);

  const isEditingNonExtendedTheme = typeof themeEditorOpen === 'string'
    && !themes.find((t) => t.id === themeEditorOpen)?.$figmaIsExtension;

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
                {isEditingNonExtendedTheme && (
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
              treeItems.map((item) => {
                const isExtended = !item.isLeaf && typeof item.value === 'string' ? isExtendedGroup(item.value) : false;
                const parentIsExtended = item.parent && typeof item.parent === 'string' && isExtendedGroup(item.parent);

                return (
                  <DragItem<TreeItem> key={item.key} item={item}>
                    {
                      item.isLeaf && typeof item.value === 'object' ? (
                        <ThemeListItemContent
                          item={item.value}
                          isActive={activeTheme?.[item.parent as string] === item.value.id}
                          onOpen={handleToggleThemeEditor}
                          groupName={item.parent as string}
                          indentationDepth={getThemeDepth((item.value as ThemeObject).id)}
                          isUnderExtendedGroup={!!parentIsExtended}
                        />
                      ) : (
                        <ThemeListGroupHeader
                          label={item.value === INTERNAL_THEMES_NO_GROUP ? INTERNAL_THEMES_NO_GROUP_LABEL : item.value as string}
                          groupName={item.value as string}
                          indentationDepth={getGroupDepth(item.value as string)}
                          isExtendedGroup={isExtended}
                          onExtendThemeGroup={handleExtendThemeGroup}
                          onDeleteThemeGroup={handleDeleteThemeGroup}
                        />
                      )
                    }
                  </DragItem>
                );
              })
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
          isExtendMode={isExtendMode}
          setIsExtendMode={setIsExtendMode}
        />
      )}
    </Modal>
  );
};

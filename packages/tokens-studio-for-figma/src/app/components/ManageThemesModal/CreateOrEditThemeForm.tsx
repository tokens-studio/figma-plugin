import React, { useCallback, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useSelector, useStore } from 'react-redux';
import {
  Box, Button, IconButton, Stack,
} from '@tokens-studio/ui';
import { NavArrowLeft } from 'iconoir-react';
import { useTranslation } from 'react-i18next';
import { useDebouncedCallback } from 'use-debounce';
import { allTokenSetsSelector, themesListSelector, usedTokenSetSelector } from '@/selectors';
import { StyledNameInputBox } from './StyledNameInputBox';
import { StyledCreateOrEditThemeFormHeaderFlex } from './StyledCreateOrEditThemeFormHeaderFlex';
import { tokenSetListToTree, tokenSetListToList, TreeItem } from '@/utils/tokenset';
import { useIsGitMultiFileEnabled } from '@/app/hooks/useIsGitMultiFileEnabled';
import { TokenSetThemeItem } from './TokenSetThemeItem';
import { StyledForm } from './StyledForm';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { RootState } from '@/app/store';
import { IconPlus } from '@/icons';
import { StyledCreateOrEditThemeFormTabsFlex } from './StyledCreateOrEditThemeFormTabsFlex';
import Input from '../Input';
import { TabButton } from '../TabButton';
import { ThemeStyleManagementForm } from './ThemeStyleManagementForm';
import { TokenSetTreeContent } from '../TokenSetTree/TokenSetTreeContent';
import { ThemeGroupDropDownMenu } from './ThemeGroupDropDownMenu';
import { SearchInputWithToggle } from '../SearchInputWithToggle';
import { track } from '@/utils/analytics';

export type FormValues = {
  name: string
  group?: string
  tokenSets: Record<string, TokenSetStatus>
};

export enum ThemeFormTabs {
  SETS = 'sets',
  STYLES_VARIABLES = 'Styles & Variables',
}

type Props = {
  id?: string
  defaultValues?: Partial<FormValues>
  onSubmit: (values: FormValues) => void
  onCancel: () => void
};

export const CreateOrEditThemeForm: React.FC<React.PropsWithChildren<React.PropsWithChildren<Props>>> = ({
  id, defaultValues, onSubmit, onCancel,
}) => {
  const store = useStore<RootState>();
  const [activeTab, setActiveTab] = useState(ThemeFormTabs.SETS);
  const [showGroupInput, setShowGroupInput] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const githubMfsEnabled = useIsGitMultiFileEnabled();
  const selectedTokenSets = useMemo(() => (
    usedTokenSetSelector(store.getState())
  ), [store]);
  const availableTokenSets = useSelector(allTokenSetsSelector);
  const themes = useSelector(themesListSelector);
  const groupNames = useMemo(() => ([...new Set(themes.filter((t) => t?.group).map((t) => t.group as string))]), [themes]);
  const { t } = useTranslation(['tokens', 'errors']);

  const treeOrListItems = useMemo(() => (
    githubMfsEnabled
      ? tokenSetListToTree(availableTokenSets)
      : tokenSetListToList(availableTokenSets)
  ), [githubMfsEnabled, availableTokenSets]);

  const filteredTreeOrListItems = useMemo(() => {
    if (!searchTerm || !isSearchActive) {
      return treeOrListItems;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const matchingItems = new Set<string>();

    // First pass: find all items that match the search term
    treeOrListItems.forEach((item) => {
      if (item.label.toLowerCase().includes(lowerSearchTerm)) {
        matchingItems.add(item.path);

        // Add all parent paths
        let currentParentPath = item.parent;
        while (currentParentPath && currentParentPath !== '') {
          matchingItems.add(currentParentPath);
          const pathToFind = currentParentPath;
          const parentItem = treeOrListItems.find((i) => i.path === pathToFind);
          currentParentPath = parentItem?.parent || null;
        }
      }
    });

    // Second pass: include children of matching folders
    treeOrListItems.forEach((item) => {
      if (!item.isLeaf && matchingItems.has(item.path)) {
        treeOrListItems.forEach((child) => {
          if (child.path.startsWith(`${item.path}/`)) {
            matchingItems.add(child.path);
          }
        });
      }
    });

    return treeOrListItems.filter((item) => matchingItems.has(item.path));
  }, [treeOrListItems, searchTerm, isSearchActive]);

  const {
    register, handleSubmit, control, resetField,
  } = useForm<FormValues>({
    defaultValues: {
      tokenSets: { ...selectedTokenSets },
      ...defaultValues,
    },
  });

  const handleGroupKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      resetField('group');
      setShowGroupInput(false);
    }
  }, [resetField]);

  const TokenSetThemeItemInput = useCallback((props: React.PropsWithChildren<{ item: TreeItem }>) => (
    <Controller
      name="tokenSets"
      control={control}
      // this is the only way to do this
      // eslint-disable-next-line
      render={({ field }) => (
        <TokenSetThemeItem
          {...props}
          value={field.value}
          onChange={field.onChange}
        />
      )}
    />
  ), [control]);

  const handleAddGroup = React.useCallback(() => [
    setShowGroupInput(true),
  ], []);
  // Debounced tracking for search events to reduce the number of events
  const debouncedTrackSearch = useDebouncedCallback((term: string) => {
    if (searchTerm.trim()) {
      track('Manage Themes Search', {
        searchTerm: term.trim(),
        searchLength: term.trim().length,
        hasResults: filteredTreeOrListItems.length > 0,
        resultCount: filteredTreeOrListItems.length,
        totalItems: treeOrListItems.length,
      });
    }
  }, 1000); // 1 second debounce

  const handleSearchTermChangeWithTracking = useCallback((term: string) => {
    setSearchTerm(term);
    debouncedTrackSearch(term);
  }, [debouncedTrackSearch]);

  const handleToggleSearch = useCallback(() => {
    setIsSearchActive(!isSearchActive);
    if (isSearchActive) {
      setSearchTerm('');
    }
  }, [isSearchActive]);

  return (
    <StyledForm id="form-create-or-edit-theme" onSubmit={handleSubmit(onSubmit)}>
      <StyledNameInputBox css={{
        width: '100%', position: 'sticky', top: 0, zIndex: 2,
      }}
      >
        <StyledCreateOrEditThemeFormHeaderFlex>
          <IconButton
            tooltip={t('returnToOverview')}
            data-testid="button-return-to-overview"
            icon={<NavArrowLeft />}
            size="small"
            variant="invisible"
            onClick={onCancel}
          />
          <Stack
            direction="row"
            align="center"
            gap={1}
            css={{
              width: '100%',
              paddingBlock: '$4',
              justifyContent: 'space-evenly',
            }}
          >
            <Stack direction="row" gap={1} align="center">
              {
            showGroupInput ? (
              <Input
                full
                autofocus
                data-testid="create-or-edit-theme-form--group--name"
                {...register('group')}
                placeholder={t('addGroup')}
                onKeyDown={handleGroupKeyDown}
                css={{
                  display: 'flex',
                }}
              />
            ) : (
              <Box css={{ width: '100%' }}>
                {
                  groupNames.length > 0 ? (
                    <Controller
                      name="group"
                      control={control}
                      // eslint-disable-next-line
                      render={({ field }) => (
                        <ThemeGroupDropDownMenu
                          availableGroups={groupNames}
                          selectedGroup={field.value}
                          onChange={field.onChange}
                          addGroup={handleAddGroup}
                        />
                      )}
                    />
                  ) : (
                    <Button
                      data-testid="button-manage-themes-modal-new-group"
                      variant="secondary"
                      icon={<IconPlus />}
                      onClick={handleAddGroup}
                      size="small"
                    >
                      {t('addGroup')}
                    </Button>
                  )
                }
              </Box>
            )
          }
              <Box css={{ margin: '0 $3' }}>/</Box>
            </Stack>
            <Stack direction="row" gap={1} align="center" css={{ flexGrow: 1 }}>
              <Input
                full
                data-testid="create-or-edit-theme-form--input--name"
                {...register('name', { required: true })}
                placeholder={t('themeName')}
              />
            </Stack>
          </Stack>

        </StyledCreateOrEditThemeFormHeaderFlex>
      </StyledNameInputBox>
      {id && (
        <>
          <StyledCreateOrEditThemeFormTabsFlex>
            <TabButton name={ThemeFormTabs.SETS} activeTab={activeTab} label={t('sets.title')} onSwitch={setActiveTab} small />
            <TabButton name={ThemeFormTabs.STYLES_VARIABLES} activeTab={activeTab} label={t('stylesAndVariables')} onSwitch={setActiveTab} small />
          </StyledCreateOrEditThemeFormTabsFlex>

          {activeTab === ThemeFormTabs.SETS && (
            <Box css={{ padding: '$3 $4' }}>
              <Stack direction="row" justify="between" align="center" gap={4}>
                <Box css={{
                  fontSize: '$small', fontWeight: '$sansMedium', color: '$fgDefault', flexShrink: 0, whiteSpace: 'nowrap',
                }}
                >
                  {t('nSets')}
                </Box>
                <SearchInputWithToggle
                  isSearchActive={isSearchActive}
                  searchTerm={searchTerm}
                  onToggleSearch={handleToggleSearch}
                  onSearchTermChange={handleSearchTermChangeWithTracking}
                  placeholder={t('searchTokenSets')}
                  tooltip={t('searchSets')}
                  autofocus
                />
              </Stack>
            </Box>
          )}
        </>
      )}
      {!id && (
        <Box css={{ padding: '$3 $4', borderBottom: '1px solid $borderSubtled' }}>
          <Stack direction="row" justify="between" align="center" gap={3}>
            <Box css={{ fontSize: '$small', fontWeight: '$sansMedium', color: '$fgDefault' }}>
              {t('sets.title')}
            </Box>
            <SearchInputWithToggle
              isSearchActive={isSearchActive}
              searchTerm={searchTerm}
              onToggleSearch={handleToggleSearch}
              onSearchTermChange={handleSearchTermChangeWithTracking}
              placeholder={t('searchTokenSets')}
              tooltip={t('searchSets')}
              autofocus
            />
          </Stack>
        </Box>
      )}
      <Stack direction="column" gap={1}>
        {(id ? activeTab === ThemeFormTabs.SETS : true) && (
        <Stack direction="column" gap={1} css={{ padding: '$3 $4 $3' }}>
          {(() => {
            if (filteredTreeOrListItems.length > 0) {
              return (
                <TokenSetTreeContent
                  items={filteredTreeOrListItems}
                  renderItemContent={TokenSetThemeItemInput}
                  keyPosition="end"
                />
              );
            }
            if (isSearchActive && searchTerm) {
              return (
                <Box css={{ padding: '$4', textAlign: 'center', color: '$fgMuted' }}>
                  No sets found
                </Box>
              );
            }
            return (
              <TokenSetTreeContent
                items={filteredTreeOrListItems}
                renderItemContent={TokenSetThemeItemInput}
                keyPosition="end"
              />
            );
          })()}
        </Stack>
        )}
        {(activeTab === ThemeFormTabs.STYLES_VARIABLES && id) && (
        <Box css={{ padding: '$3' }}>
          <Box css={{ padding: '$1', marginBottom: '$2' }}>
            {t('stylesVarMultiDimensionalThemesWarning')}
          </Box>
          <ThemeStyleManagementForm id={id} />
        </Box>
        )}
      </Stack>
    </StyledForm>
  );
};

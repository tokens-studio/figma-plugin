import React, { useCallback, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useSelector, useStore } from 'react-redux';
import {
  Box, Button, IconButton, Stack,
} from '@tokens-studio/ui';
import { NavArrowLeft } from 'iconoir-react';
import { useTranslation } from 'react-i18next';
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

      <StyledCreateOrEditThemeFormTabsFlex>
        <TabButton name={ThemeFormTabs.SETS} activeTab={activeTab} label={t('sets.title')} onSwitch={setActiveTab} small />
        <TabButton name={ThemeFormTabs.STYLES_VARIABLES} activeTab={activeTab} label={t('stylesAndVariables')} onSwitch={setActiveTab} small />
      </StyledCreateOrEditThemeFormTabsFlex>
      )}
      <Stack direction="column" gap={1}>
        {activeTab === ThemeFormTabs.SETS && (
        <Stack direction="column" gap={1} css={{ padding: '$3 $4 $3' }}>
          <TokenSetTreeContent
            items={treeOrListItems}
            renderItemContent={TokenSetThemeItemInput}
            keyPosition="end"
          />
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

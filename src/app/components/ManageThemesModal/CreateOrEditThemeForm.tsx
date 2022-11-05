import React, { useCallback, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useSelector, useStore } from 'react-redux';
import Input from '../Input';
import { allTokenSetsSelector, usedTokenSetSelector } from '@/selectors';
import { StyledNameInputBox } from './StyledNameInputBox';
import { StyledCreateOrEditThemeFormHeaderFlex } from './StyledCreateOrEditThemeFormHeaderFlex';
import { tokenSetListToTree, tokenSetListToList, TreeItem } from '@/utils/tokenset';
import { useIsGitMultiFileEnabled } from '@/app/hooks/useIsGitMultiFileEnabled';
import { TokenSetListOrTree } from '../TokenSetListOrTree';
import { TokenSetThemeItem } from './TokenSetThemeItem';
import { StyledForm } from './StyledForm';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import Box from '../Box';
import { RootState } from '@/app/store';
import IconButton from '../IconButton';
import { IconBack } from '@/icons';
import { StyledCreateOrEditThemeFormTabsFlex } from './StyledCreateOrEditThemeFormTabsFlex';
import { TabButton } from '../TabButton';
import { ThemeStyleManagementForm } from './ThemeStyleManagentForm';

export type FormValues = {
  name: string
  tokenSets: Record<string, TokenSetStatus>
};

export enum ThemeFormTabs {
  SETS = 'sets',
  STYLES = 'styles',
}

type Props = {
  id?: string
  defaultValues?: Partial<FormValues>
  onSubmit: (values: FormValues) => void
  onCancel: () => void
};

export const CreateOrEditThemeForm: React.FC<Props> = ({
  id, defaultValues, onSubmit, onCancel,
}) => {
  const store = useStore<RootState>();
  const [activeTab, setActiveTab] = useState(ThemeFormTabs.SETS);
  const githubMfsEnabled = useIsGitMultiFileEnabled();
  const selectedTokenSets = useMemo(() => (
    usedTokenSetSelector(store.getState())
  ), [store]);
  const availableTokenSets = useSelector(allTokenSetsSelector);

  const treeOrListItems = useMemo(() => (
    githubMfsEnabled
      ? tokenSetListToTree(availableTokenSets)
      : tokenSetListToList(availableTokenSets)
  ), [githubMfsEnabled, availableTokenSets]);

  const { register, handleSubmit, control } = useForm<FormValues>({
    defaultValues: {
      tokenSets: { ...selectedTokenSets },
      ...defaultValues,
    },
  });

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

  return (
    <StyledForm id="form-create-or-edit-theme" onSubmit={handleSubmit(onSubmit)}>
      <StyledNameInputBox>
        <StyledCreateOrEditThemeFormHeaderFlex>
          <IconButton
            tooltip="Return to overview"
            data-cy="button-return-to-overview"
            data-testid="button-return-to-overview"
            icon={<IconBack />}
            onClick={onCancel}
          />
          <Input
            data-cy="create-or-edit-theme-form--input--name"
            data-testid="create-or-edit-theme-form--input--name"
            {...register('name', { required: true })}
          />
          <StyledCreateOrEditThemeFormTabsFlex>
            <TabButton name={ThemeFormTabs.SETS} activeTab={activeTab} label="Sets" onSwitch={setActiveTab} />
            <TabButton name={ThemeFormTabs.STYLES} disabled={!id} activeTab={activeTab} label="Styles" onSwitch={setActiveTab} />
          </StyledCreateOrEditThemeFormTabsFlex>
        </StyledCreateOrEditThemeFormHeaderFlex>
      </StyledNameInputBox>
      {activeTab === ThemeFormTabs.SETS && (
        <Box css={{ paddingTop: '$4' }}>
          <TokenSetListOrTree
            displayType={githubMfsEnabled ? 'tree' : 'list'}
            items={treeOrListItems}
            renderItemContent={TokenSetThemeItemInput}
          />
        </Box>
      )}
      {(activeTab === ThemeFormTabs.STYLES && id) && (
        <Box css={{ paddingTop: '$4' }}>
          <ThemeStyleManagementForm id={id} />
        </Box>
      )}
    </StyledForm>
  );
};

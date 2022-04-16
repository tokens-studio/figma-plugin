import React, { useCallback, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useSelector } from 'react-redux';
import Input from '../Input';
import { allTokenSetsSelector } from '@/selectors';
import { StyledNameInputBox } from './StyledNameInputBox';
import { tokenSetListToTree, tokenSetListToList, TreeItem } from '@/utils/tokenset';
import { useIsGithubMultiFileEnabled } from '@/app/hooks/useIsGithubMultiFileEnabled';
import { TokenSetListOrTree } from '../TokenSetListOrTree';
import { TokenSetThemeItem } from './TokenSetThemeItem';
import { StyledForm } from './StyledForm';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import Box from '../Box';

export type FormValues = {
  name: string
  tokenSets: Record<string, TokenSetStatus>
};

type Props = {
  id?: string
  defaultValues?: Partial<FormValues>
  onSubmit: (values: FormValues) => void
};

export const CreateOrEditThemeForm: React.FC<Props> = ({ defaultValues, onSubmit }) => {
  const githubMfsEnabled = useIsGithubMultiFileEnabled();
  const availableTokenSets = useSelector(allTokenSetsSelector);

  const treeOrListItems = useMemo(() => (
    githubMfsEnabled
      ? tokenSetListToTree(availableTokenSets)
      : tokenSetListToList(availableTokenSets)
  ), [githubMfsEnabled, availableTokenSets]);

  const { register, handleSubmit, control } = useForm<FormValues>({
    defaultValues: {
      tokenSets: {},
      ...defaultValues,
    },
  });

  const TokenSetThemeItemInput = useCallback((props: React.PropsWithChildren<{ item: TreeItem }>) => (
    <Controller
      name="tokenSets"
      control={control}
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
        <Input label="Name" {...register('name', { required: true })} />
      </StyledNameInputBox>
      <Box css={{ paddingTop: '$4' }}>
        <TokenSetListOrTree
          displayType={githubMfsEnabled ? 'tree' : 'list'}
          items={treeOrListItems}
          renderItemContent={TokenSetThemeItemInput}
        />
      </Box>
    </StyledForm>
  );
};

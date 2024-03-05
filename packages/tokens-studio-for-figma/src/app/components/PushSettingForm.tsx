import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Heading, Textarea, Stack, Box, Text, TextInput, FormField, Label,
} from '@tokens-studio/ui';
import { localApiStateSelector } from '@/selectors';

import PushDialogSupernovaConfirm from './PushDialogSupernovaConfirm';
import { StorageProviderType } from '@/constants/StorageProviderType';

type Props = {
  commitMessage: string,
  branch: string,
  handleCommitMessageChange: (val: string) => void,
  handleBranchChange: (event: React.ChangeEvent<HTMLInputElement>) => void
};

function PushSettingForm({
  commitMessage, branch, handleCommitMessageChange, handleBranchChange,
}: Props) {
  const localApiState = useSelector(localApiStateSelector);

  const handleMessageChange = useCallback((value: string) => {
    handleCommitMessageChange(value);
  }, [handleCommitMessageChange]);

  const { t } = useTranslation(['sync']);

  return localApiState.provider === StorageProviderType.SUPERNOVA ? <PushDialogSupernovaConfirm designSystemUrl={localApiState.designSystemUrl} /> : (
    <Stack direction="column" gap={3} css={{ padding: '$4', width: '100%' }}>
      <Text size="small">{t('pushYourLocalChangesToYourRepository')}</Text>
      <Box css={{
        padding: '$2', fontFamily: '$mono', color: '$fgMuted', background: '$bgSubtle', borderRadius: '$medium',
      }}
      >
        {'id' in localApiState ? localApiState.id : null}
      </Box>
      <Heading size="small">{t('commitMessage')}</Heading>
      <Textarea
        data-testid="push-dialog-commit-message"
        rows={3}
        value={commitMessage}
        onChange={handleMessageChange}
        placeholder="Enter commit message"
      />
      <FormField>
        <Label htmlFor="branch">{t('branch')}</Label>
        <TextInput
          value={branch}
          onChange={handleBranchChange}
          type="text"
          name="branch"
          id="branch"
          required
        />
      </FormField>
    </Stack>
  );
}

export default PushSettingForm;

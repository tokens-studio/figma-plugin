import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Stack from './Stack';
import { localApiStateSelector } from '@/selectors';
import Box from './Box';
import Text from './Text';
import Heading from './Heading';
import Textarea from './Textarea';
import Input from './Input';
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

  const handleMessageChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleCommitMessageChange(event.target.value);
  }, [handleCommitMessageChange]);

  const { t } = useTranslation(['sync']);

  return localApiState.provider === StorageProviderType.SUPERNOVA ? <PushDialogSupernovaConfirm designSystemUrl={localApiState.designSystemUrl} /> : (
    <Stack direction="column" gap={3} css={{ padding: '0 $4' }}>
      <Text size="small">{t('pushYourLocalChangesToYourRepository')}</Text>
      <Box css={{
        padding: '$2', fontFamily: '$mono', color: '$fgMuted', background: '$bgSubtle', borderRadius: '$medium',
      }}
      >
        {'id' in localApiState ? localApiState.id : null}
      </Box>
      <Heading size="small">{t('commitMessage')}</Heading>
      <Textarea
        id="push-dialog-commit-message"
        border
        rows={3}
        value={commitMessage}
        onChange={handleMessageChange}
        placeholder="Enter commit message"
      />
      <Input
        full
        label="Branch"
        value={branch}
        onChange={handleBranchChange}
        type="text"
        name="branch"
        required
      />
    </Stack>
  );
}

export default PushSettingForm;

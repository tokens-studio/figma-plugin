import React from 'react';
import { useTranslation } from 'react-i18next';
import { Heading } from '@tokens-studio/ui';
import Box from './Box';
import Text from './Text';
import Stack from './Stack';

type Props = {
  designSystemUrl: string | undefined;
};

function PushDialogSupernovaConfirm({ designSystemUrl }: Props) {
  const { t } = useTranslation(['sync']);

  return (
    <Stack direction="column" gap={3} css={{ padding: '0 $4' }}>
      <Text size="small">{t('pushYourLocalChangesToYourSupernovaIoDesignSystem')}</Text>
      <Heading size="small">{t('designSystem')}</Heading>
      <Box
        css={{
          padding: '$2',
          fontFamily: '$mono',
          color: '$fgMuted',
          background: '$bgSubtle',
          borderRadius: '$medium',
        }}
      >
        {designSystemUrl || t('designSystem')}
      </Box>
    </Stack>
  );
}
export default PushDialogSupernovaConfirm;

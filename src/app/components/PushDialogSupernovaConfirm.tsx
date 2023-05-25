import React from 'react';
import Heading from './Heading';
import Box from './Box';
import Text from './Text';
import Stack from './Stack';

type Props = {
  designSystemUrl: string | undefined;
};

function PushDialogSupernovaConfirm({ designSystemUrl }: Props) {
  return (
    <Stack direction="column" gap={3} css={{ padding: '0 $4' }}>
      <Text size="small">Push your local changes to your Supernova.io design system.</Text>
      <Heading size="small">Design system</Heading>
      <Box
        css={{
          padding: '$2',
          fontFamily: '$mono',
          color: '$textMuted',
          background: '$bgSubtle',
          borderRadius: '$card',
        }}
      >
        {designSystemUrl || 'Design system'}
      </Box>
    </Stack>
  );
}
export default PushDialogSupernovaConfirm;

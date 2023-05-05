import React from 'react';
import Heading from './Heading';
import Box from './Box';

type Props = {
  designSystemUrl: string | undefined;
};

function PushDialogSupernovaConfirm({ designSystemUrl }: Props) {
  return (
    <>
      <p className="text-xs">Push your local changes to your Supernova.io design system.</p>
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
    </>
  );
}
export default PushDialogSupernovaConfirm;

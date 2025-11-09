import React from 'react';
import { Box, Stack } from '@tokens-studio/ui';
import AddLicenseKey from '../AddLicenseKey/AddLicenseKey';

export function Subscription() {
  return (
    <Box className="content scroll-container">
      <Stack direction="column" gap={4} css={{ padding: '$3 0' }}>
        <AddLicenseKey />
      </Stack>
    </Box>
  );
}

export default Subscription;

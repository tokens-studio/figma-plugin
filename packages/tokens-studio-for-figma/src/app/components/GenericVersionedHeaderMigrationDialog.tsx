import React from 'react';
import {
  Stack, Box, Heading, Text, Button,
} from '@tokens-studio/ui';
import { Modal } from './Modal/Modal';

export type GenericVersionedHeaderMigrationDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const GENERIC_VERSIONED_HEADER_MIGRATION_KEY = 'seenGenericVersionedHeaderMigrationDialog';

export default function GenericVersionedHeaderMigrationDialog({ isOpen, onClose }: GenericVersionedHeaderMigrationDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      title="Security Update: Generic Versioned Storage Headers"
      showClose
      close={onClose}
    >
      <Stack direction="column" gap={4}>
        <Heading size="medium">Security Update</Heading>
        <Text>
          We have improved the security of Generic Versioned Storage providers.
          {' '}
          <b>Additional headers</b>
          {' '}
          are now stored only in your client (browser) and
          {' '}
          <b>no longer saved in shared plugin data</b>
          .
        </Text>
        <Text>
          This change ensures sensitive information in headers is never shared with other collaborators or stored in Figma files.
        </Text>
        <Text>
          You are seeing this message because you have a Generic Versioned Storage provider configured. This dialog will only appear once.
        </Text>
        <Box css={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="primary" onClick={onClose}>OK</Button>
        </Box>
      </Stack>
    </Modal>
  );
}

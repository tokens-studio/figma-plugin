import {
  Stack, Box, Heading, Text, Button,
} from '@tokens-studio/ui';
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@/app/store';

import { StorageProviderType } from '@/constants/StorageProviderType';

import { Modal } from './Modal/Modal';

export const GENERIC_VERSIONED_HEADER_MIGRATION_KEY = 'seenGenericVersionedHeaderMigrationDialog';

export default function GenericVersionedHeaderMigrationDialog() {
  const dispatch = useDispatch<Dispatch>();
  const apiProviders = useSelector((state: any) => state.uiState?.apiProviders || []);
  const seenFlag = useSelector((state: any) => state.settings?.seenGenericVersionedHeaderMigrationDialog ?? false);
  const setSeenFlag = useCallback((flag: boolean) => {
    dispatch.settings.setSeenGenericVersionedHeaderMigrationDialog(flag);
  }, [dispatch]);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const hasGeneric = apiProviders?.some((p) => p?.provider === StorageProviderType.GENERIC_VERSIONED_STORAGE);
    if (!seenFlag && hasGeneric) {
      setOpen(true);
    }
  }, [apiProviders, seenFlag]);
  const handleClose = useCallback(() => {
    setSeenFlag(true);
    setOpen(false);
  }, [setSeenFlag]);
  if (!open) return null;
  return (
    <Modal
      isOpen={open}
      title="Security Update: Generic Versioned Storage Headers"
      showClose
      close={handleClose}
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
          <Button variant="primary" onClick={handleClose}>OK</Button>
        </Box>
      </Stack>
    </Modal>
  );
}

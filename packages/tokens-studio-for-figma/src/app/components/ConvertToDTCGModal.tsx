import { Button, DropdownMenu, Stack } from '@tokens-studio/ui';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from './Modal';
import { Dispatch } from '../store';
import { TokenFormatOptions } from '@/plugin/TokenFormatStoreClass';
import { tokenFormatSelector } from '@/selectors/tokenFormatSelector';

export function ConvertToDTCGModal({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (isOpen: boolean) => void }) {
  const dispatch = useDispatch<Dispatch>();
  const tokenFormat = useSelector(tokenFormatSelector);

  const handleClose = React.useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const handleConvert = React.useCallback(() => {
    dispatch.tokenState.setTokenFormat(TokenFormatOptions.DTCG);
  }, [dispatch]);

  return (
    <Modal title="Convert to W3C DTCG format" isOpen={isOpen} close={handleClose} showClose>
      {tokenFormat === TokenFormatOptions.Legacy ? (
        <Stack direction="column" align="start" gap={4} css={{ color: '$fgMuted', fontSize: '$xsmall' }}>
          Your tokens are currently stored in the legacy format. If you want to use the new W3C DTCG format, you can
          convert them here. Read all about changing the format here, including helpful advice on how to migrate your
          development pipeline.
          <Button variant="primary" onClick={handleConvert}>
            Convert now
          </Button>
        </Stack>
      ) : (
        <Stack direction="column" align="start" gap={4} css={{ color: '$fgMuted', fontSize: '$xsmall' }}>
          All done! Your tokens are now stored in the W3C DTCG format. Still need to migrate your development pipeline? Read all about transforming tokens with the W3C DTCG format here.
          <Button onClick={handleClose}>
            Close
          </Button>
        </Stack>
      )}
    </Modal>
  );
}

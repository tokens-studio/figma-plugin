import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Dispatch } from '@/app/store';
import Heading from '../Heading';
import Button from '../Button';
import Modal from '../Modal';
import Stack from '../Stack';
import LoadProvider from '../LoadProviderSelector';
import { LoadProviderType } from '@/constants/LoadProviderType';

type Props = {
  onClose: () => void
};

export default function ExportModal({ onClose }: Props) {
  const [loadProvider, setLoadProvider] = useState<string>(LoadProviderType.PRESET);
  const dispatch = useDispatch<Dispatch>();
  const handleSetDefault = React.useCallback(() => {
    dispatch.tokenState.setDefaultTokens();
    onClose();
  }, [dispatch, onClose]);

  const handleProviderClick = React.useCallback((provider: string) => () => {
    setLoadProvider(provider);
  }, [loadProvider]);

  const loadProviderText = () => {
    switch (loadProvider) {
      case LoadProviderType.PRESET:
        return (
          <p className="text-xs text-gray-600">
            Override your current tokens by applying a preset. Want your preset featured here? Submit it via
            {' '}
            <a
              target="_blank"
              rel="noreferrer"
              className="underline"
              href="https://github.com/six7/figma-tokens/issues"
            >
              GitHub
            </a>
          </p>
        );
      case LoadProviderType.FILE:
        return (
          <p className="text-xs text-gray-600">
            Import your existing tokens JSON files into the plugin. If you're using a single file, the first-level keys should be the token set names. If you're using multiple files, the file name / path are the set names.
          </p>
        );
      default:
        return null;
    }
  }

  return (
    <Modal showClose isOpen close={onClose}>
      <Stack direction="column" justify="center" gap={4} css={{ textAlign: 'center' }}>
        <Stack direction="column" gap={2}>
          <Stack direction='row' gap={1}>
            <LoadProvider
              isActive={loadProvider === LoadProviderType.PRESET}
              onClick={handleProviderClick(LoadProviderType.PRESET)}
              text="Preset"
              id={LoadProviderType.PRESET}
            />
            <LoadProvider
              isActive={loadProvider === LoadProviderType.FILE}
              onClick={handleProviderClick(LoadProviderType.FILE)}
              text="File"
              id={LoadProviderType.FILE}
            />
          </Stack>
          <Heading>Import</Heading>
          {
            loadProviderText()
          }
          <Button variant="primary" onClick={handleSetDefault}>
            Apply default preset
          </Button>
        </Stack>
      </Stack>
    </Modal>
  );
}

import React from 'react';
import { Button, Stack } from '@tokens-studio/ui';
import { useTranslation } from 'react-i18next';
import Modal from '../Modal';
import Input from '../Input';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

type Props = { isOpen: boolean; onClose: () => void };

export default function LivingDocumentationModal({ isOpen, onClose }: Props) {
  const { t } = useTranslation(['tokens']);
  const [tokenSet, setTokenSet] = React.useState('');
  const [startsWith, setStartsWith] = React.useState('');

  const handleTokenSetChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTokenSet(e.target.value);
  }, []);

  const handleStartsWithChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStartsWith(e.target.value);
  }, []);

  const handleGenerate = React.useCallback(() => {
    AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.CREATE_LIVING_DOCUMENTATION,
      tokenSet,
      startsWith,
    });
    onClose();
  }, [tokenSet, startsWith, onClose]);

  return (
    <Modal title={t('generateDocumentation')} isOpen={isOpen} close={onClose} size="large">
      <Stack direction="column" gap={4}>
        <Input
          full
          label={t('tokenSetRequired')}
          value={tokenSet}
          onChange={handleTokenSetChange}
          required
        />
        <Input
          full
          label={t('nameStartsWith')}
          value={startsWith}
          onChange={handleStartsWithChange}
        />
        <Stack direction="row" justify="end" gap={4}>
          <Button variant="secondary" onClick={onClose}>{t('cancel')}</Button>
          <Button
            variant="primary"
            onClick={handleGenerate}
            disabled={!tokenSet.trim()}
          >
            {t('generate')}
          </Button>
        </Stack>
      </Stack>
    </Modal>
  );
}

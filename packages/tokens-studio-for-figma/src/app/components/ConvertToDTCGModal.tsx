import {
  Box, Button, Link, Stack,
} from '@tokens-studio/ui';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { AVAILABLE_PROVIDERS } from '@sync-providers/constants';
import Modal from './Modal';
import { Dispatch } from '../store';
import { TokenFormatOptions } from '@/plugin/TokenFormatStoreClass';
import { tokenFormatSelector } from '@/selectors/tokenFormatSelector';
import { useChangedState } from '@/hooks/useChangedState';
import { ErrorMessage } from './ErrorMessage';
import { showConvertTokenFormatModalSelector } from '@/selectors/showConvertTokenFormatModalSelector';
import useRemoteTokens from '../store/remoteTokens';
import w3cConvertImage from '@/app/assets/hints/w3cformat.png';
import legacyConvertImage from '@/app/assets/hints/legacyformat.png';
import { storageTypeSelector } from '@/selectors';

export function ConvertToDTCGModal() {
  const dispatch = useDispatch<Dispatch>();
  const showConvertTokenFormatModal = useSelector(showConvertTokenFormatModalSelector);
  const tokenFormat = useSelector(tokenFormatSelector);
  const { hasChanges } = useChangedState();
  const { pushTokens } = useRemoteTokens();
  const { t } = useTranslation(['storage']);
  const storageType = useSelector(storageTypeSelector);

  const isDTCG = tokenFormat === TokenFormatOptions.DTCG;

  const handleClose = React.useCallback(() => {
    dispatch.uiState.setShowConvertTokenFormatModal(false);
  }, [dispatch.uiState]);

  const handleConvert = React.useCallback(() => {
    dispatch.tokenState.setTokenFormat(isDTCG ? TokenFormatOptions.Legacy : TokenFormatOptions.DTCG);
    dispatch.uiState.setShowConvertTokenFormatModal(false);
    if (storageType.provider === AVAILABLE_PROVIDERS.LOCAL) return;
    pushTokens({
      overrides: isDTCG ? {
        branch: 'w3c-dtcg-conversion-revert',
        commitMessage: 'Revert conversion to W3C DTCG format',
      } : {
        branch: 'w3c-dtcg-conversion',
        commitMessage: 'Convert to W3C DTCG format, read more at https://docs.tokens.studio/convert-to-dtcg-format',
      },
    });
  }, [dispatch, pushTokens, isDTCG, storageType]);

  const hasRemoteChanges = hasChanges && storageType.provider !== AVAILABLE_PROVIDERS.LOCAL;

  return (
    <Modal title={isDTCG ? t('w3cformatmodaltitle') : t('w3cconverttitle')} isOpen={showConvertTokenFormatModal} close={handleClose} showClose>
      <Stack direction="column" align="start" gap={4} css={{ color: '$fgMuted', fontSize: '$xsmall' }}>
        <Box as="img" src={isDTCG ? legacyConvertImage : w3cConvertImage} css={{ borderRadius: '$small' }} />
        <Box>
          {isDTCG ? t('w3cformatmodaldescription') : t('legacyformatmodaldescription')}
        </Box>
        <Stack gap={4} align="center">
          <Button variant="primary" onClick={handleConvert} disabled={hasRemoteChanges}>
            {isDTCG ? t('converttolegacy') : t('converttow3c')}
          </Button>
          <Link href="https://docs.tokens.studio/convert-to-dtcg-format" target="_blank">{t('readmoreformat')}</Link>
        </Stack>
        {hasRemoteChanges && <ErrorMessage>{t('pushfirsterror')}</ErrorMessage>}
      </Stack>
    </Modal>
  );
}

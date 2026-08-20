import {
  Box, Button, Link, Stack,
} from '@tokens-studio/ui';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
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
import { lastSyncedStateSelector, storageTypeSelector } from '@/selectors';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { getLastSyncedFormat } from '@/utils/compareLastSyncedState';

export function ConvertToDTCGModal() {
  const dispatch = useDispatch<Dispatch>();
  const showConvertTokenFormatModal = useSelector(showConvertTokenFormatModalSelector);
  const tokenFormat = useSelector(tokenFormatSelector);
  const lastSyncedState = useSelector(lastSyncedStateSelector);
  const { hasChanges, changedPushState } = useChangedState();
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
    if (storageType.provider === StorageProviderType.LOCAL) return;
    // No tokenFormatChanged plumbing: pushTokensToGitHub detects the flip imperatively by
    // comparing TokenFormat.format (singleton, updated synchronously by the setTokenFormat
    // effect) against getLastSyncedFormat(lastSyncedState) at push time.
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

  // A pending format flip is itself a "change" (via compareLastSyncedState), which would
  // otherwise disable the revert button — trapping the user with no way to undo through this
  // UI if they cancelled or failed the push dialog. Exempt the format-only case so the
  // reverse conversion stays reachable; token/theme edits still block as before.
  const tokenFormatChanged = tokenFormat !== getLastSyncedFormat(lastSyncedState)
    && getLastSyncedFormat(lastSyncedState) !== undefined;
  const isFormatOnlyDiff = tokenFormatChanged
    && Object.keys(changedPushState.tokens).length === 0
    && changedPushState.themes.length === 0;
  const hasRemoteChanges = hasChanges && !isFormatOnlyDiff && storageType.provider !== StorageProviderType.LOCAL;

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
          <Link href="https://docs.tokens.studio/manage-settings/token-format" target="_blank">{t('readmoreformat')}</Link>
        </Stack>
        {hasRemoteChanges && <ErrorMessage>{t('pushfirsterror')}</ErrorMessage>}
      </Stack>
    </Modal>
  );
}

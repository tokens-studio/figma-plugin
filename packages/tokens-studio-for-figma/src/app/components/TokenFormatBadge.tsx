import React, { useCallback } from 'react';
import {
  Button,
  IconButton,
} from '@tokens-studio/ui';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Dispatch } from '../store';
import { TokenFormatOptions } from '@/plugin/TokenFormatStoreClass';
import { tokenFormatSelector } from '@/selectors/tokenFormatSelector';
import DesignTokenIcon from '@/icons/designtoken.svg';
import LegacyFormatIcon from '@/icons/legacyformat.svg';

export function TokenFormatBadge({ extended = false }: { extended?: boolean }) {
  const { t } = useTranslation(['storage']);
  const tokenFormat = useSelector(tokenFormatSelector);
  const dispatch = useDispatch<Dispatch>();

  const isDTCG = tokenFormat === TokenFormatOptions.DTCG;

  const handleOpenModal = useCallback(() => {
    dispatch.uiState.setShowConvertTokenFormatModal(true);
  }, [dispatch.uiState]);

  if (extended) {
    return isDTCG ? <Button icon={<DesignTokenIcon />} onClick={handleOpenModal} variant="invisible" size="small">{t('w3cformat')}</Button> : <Button icon={<LegacyFormatIcon />} onClick={handleOpenModal} variant="invisible" size="small">{t('legacyformat')}</Button>;
  }

  return isDTCG ? <IconButton tooltip={t('w3cformat')} tooltipSide="top" onClick={handleOpenModal} variant="invisible" size="small" icon={<DesignTokenIcon />} /> : (
    <IconButton tooltip={t('legacyformattooltip')} tooltipSide="top" onClick={handleOpenModal} variant="invisible" size="small" icon={<LegacyFormatIcon />} />
  );
}

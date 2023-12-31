/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Button, Label, Stack, Text,
} from '@tokens-studio/ui';
import remConfigurationImage from '@/app/assets/hints/remConfiguration.png';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { TokenTypes } from '@/constants/TokenTypes';
import { mergeTokenGroups } from '@/utils/tokenHelpers';
import { Dispatch } from '../store';
import {
  tokensSelector, usedTokenSetSelector, activeTokenSetSelector, aliasBaseFontSizeSelector,
} from '@/selectors';
import DownshiftInput from './DownshiftInput';
import { getAliasValue } from '@/utils/alias';
import { defaultTokenResolver } from '@/utils/TokenResolver';
import Modal from './Modal';
import { ExplainerModal } from './ExplainerModal';

const RemConfiguration = () => {
  const aliasBaseFontSize = useSelector(aliasBaseFontSizeSelector);
  const tokens = useSelector(tokensSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const activeTokenSet = useSelector(activeTokenSetSelector);
  const dispatch = useDispatch<Dispatch>();
  const { t } = useTranslation(['settings']);
  const [modalVisible, setModalVisible] = React.useState(false);

  const toggleModalVisible = React.useCallback(() => setModalVisible((prev) => !prev), []);

  const resolvedTokens = React.useMemo(
    () => defaultTokenResolver.setTokens(
      mergeTokenGroups(tokens, {
        ...usedTokenSet,
        [activeTokenSet]: TokenSetStatus.ENABLED,
      }),
    ),
    [tokens, usedTokenSet, activeTokenSet],
  );

  const handleBaseFontSizeChange = React.useCallback(
    (property: string, value: string) => {
      dispatch.settings.setAliasBaseFontSize(value);
      const resolvedValue = getAliasValue(value, resolvedTokens);
      if (typeof resolvedValue === 'string' || typeof resolvedValue === 'number') {
        dispatch.settings.setBaseFontSize(String(resolvedValue));
      }
    },
    [dispatch.settings, resolvedTokens],
  );

  const handleDownShiftInputChange = React.useCallback(
    (newInputValue: string) => {
      dispatch.settings.setAliasBaseFontSize(newInputValue);
      const resolvedValue = getAliasValue(newInputValue, resolvedTokens);
      if (typeof resolvedValue === 'string' || typeof resolvedValue === 'number') {
        dispatch.settings.setBaseFontSize(String(resolvedValue));
      }
    },
    [dispatch.settings, resolvedTokens],
  );

  return (
    <Stack direction="row" align="center" justify="between" css={{ width: '100%' }}>
      <Stack direction="row" align="center" gap={1}>
        <Label>{t('baseFont')}</Label>
        <ExplainerModal title={t('baseFont')}>
          <Box as="img" src={remConfigurationImage} css={{ borderRadius: '$small' }} />
          <Box>{t('baseFontExplanation')}</Box>
        </ExplainerModal>
      </Stack>

      <Button onClick={toggleModalVisible} variant="secondary">
        {t('change')}
      </Button>

      <Modal
        isOpen={modalVisible}
        close={toggleModalVisible}
        title={t('baseFont')}
        showClose
        modal={false}
        footer={(
          <Stack direction="row" justify="end">
            <Button onClick={toggleModalVisible} variant="primary">
              {t('confirm')}
            </Button>
          </Stack>
        )}
      >
        <Stack direction="column" gap={3} css={{ padding: '$4' }}>
          <Text muted>{t('baseFontExplanation')}</Text>
          <Label>{t('chooseANewToken')}</Label>
          <Box css={{ position: 'relative' }}>
            <DownshiftInput
              value={aliasBaseFontSize}
              type={TokenTypes.FONT_SIZES}
              resolvedTokens={resolvedTokens}
              handleChange={handleBaseFontSizeChange}
              setInputValue={handleDownShiftInputChange}
              suffix
              arrow="top"
            />
          </Box>
        </Stack>

      </Modal>
    </Stack>
  );
};

export default RemConfiguration;

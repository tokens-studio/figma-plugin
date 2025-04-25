/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Button, Label, Stack, Text,
} from '@tokens-studio/ui';
import remConfigurationImage from '@/app/assets/hints/remConfiguration.png';
import IconBrokenLink from '@/icons/brokenlink.svg';
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
  const [isBrokenLink, setIsBrokenLink] = React.useState<boolean>(false);

  const toggleModalVisible = React.useCallback(() => setModalVisible((prev) => !prev), []);

  const resolvedTokens = React.useMemo(
    () => defaultTokenResolver.setTokens(
      mergeTokenGroups(tokens, usedTokenSet, {}, activeTokenSet),
    ),
    [tokens, usedTokenSet, activeTokenSet],
  );

  const displayBaseFontValue = React.useMemo(() => {
    const resolvedAliasBaseFontSize = getAliasValue(aliasBaseFontSize, resolvedTokens);
    let formattedpxValue = 16;
    if (typeof resolvedAliasBaseFontSize === 'string' || typeof resolvedAliasBaseFontSize === 'number') {
      const resolvedAliasBaseFontSizeValue = typeof resolvedAliasBaseFontSize === 'number'
        ? resolvedAliasBaseFontSize
        : parseFloat(resolvedAliasBaseFontSize);
      if (isNaN(resolvedAliasBaseFontSizeValue)) {
        formattedpxValue = 16;
        setIsBrokenLink(true);
      } else {
        formattedpxValue = Number(resolvedAliasBaseFontSizeValue.toFixed(2));
        setIsBrokenLink(false);
      }
      return `1rem = ${formattedpxValue}px`;
    }
    return '1rem = 16px';
  }, [aliasBaseFontSize, resolvedTokens]);

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
      <Stack direction="column" align="start" gap={1}>
        <Stack direction="row" align="center" gap={1}>
          <Label>{t('baseFont')}</Label>
          <ExplainerModal title={displayBaseFontValue}>
            <Box as="img" src={remConfigurationImage} css={{ borderRadius: '$small' }} />
            <Box>{t('baseFontExplanation')}</Box>
          </ExplainerModal>
        </Stack>
        <Stack direction="row" align="center" gap={1}>
          {aliasBaseFontSize.startsWith('{') && (
            <Box
              css={{
                borderRadius: '$small',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: isBrokenLink ? '$dangerBg' : '$accentBg',
                padding: '$2',
              }}
            >
              <Label css={{ fontSize: '$small', color: isBrokenLink ? '$dangerFg' : '$accentDefault' }}>
                {aliasBaseFontSize}
              </Label>
              {isBrokenLink && (
                <IconBrokenLink
                  style={{
                    color: 'var(--colors-dangerFg)', width: 'var(--sizes-6)', height: 'var(--sizes-6)', marginLeft: '3px',
                  }}
                />
              )}
            </Box>
          )}
          <Label
            css={{
              fontSize: '$xsmall',
              color: '$fgMuted',
              marginLeft: aliasBaseFontSize.startsWith('{') ? '$3' : '',
            }}
          >
            {displayBaseFontValue}
          </Label>
        </Stack>
      </Stack>

      <Button onClick={toggleModalVisible} variant="secondary">
        {t('change')}
      </Button>

      <Modal
        isOpen={modalVisible}
        close={toggleModalVisible}
        title={displayBaseFontValue}
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
            />
          </Box>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default RemConfiguration;

import React from 'react';
import {
  Button, Stack, Select, Switch, Label, Text, IconButton, TextInput, FormField,
} from '@tokens-studio/ui';
import { Asterisk } from 'iconoir-react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { styled } from '@/stitches.config';
import Modal from '../Modal';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import {
  allTokenSetsSelector,
  tokensSelector,
  usedTokenSetSelector,
  activeTokenSetSelector,
  activeThemeSelector,
  themesListSelector,
} from '@/selectors';
import { mergeTokenGroups, getOverallConfig } from '@/utils/tokenHelpers';
import { defaultTokenResolver } from '@/utils/TokenResolver';
import { track } from '@/utils/analytics';

const StyledCode = styled('code', {
  backgroundColor: '$bgSubtle',
  padding: '$1 $2',
  borderRadius: '$small',
  fontFamily: '$mono',
  fontSize: '$xsmall',
});

type Props = {
  isOpen: boolean;
  onClose: () => void;
  initialTokenSet?: string;
  initialStartsWith?: string;
};

export default function LivingDocumentationModal({
  isOpen, onClose, initialTokenSet, initialStartsWith,
}: Props) {
  const { t } = useTranslation(['tokens']);
  const allTokenSets = useSelector(allTokenSetsSelector);
  const tokens = useSelector(tokensSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const activeTokenSet = useSelector(activeTokenSetSelector);
  const activeTheme = useSelector(activeThemeSelector);
  const themes = useSelector(themesListSelector);
  const [tokenSet, setTokenSet] = React.useState(initialTokenSet || 'All');
  const [startsWith, setStartsWith] = React.useState(initialStartsWith || '');
  const [applyTokens, setApplyTokens] = React.useState(true);
  const [useRegex, setUseRegex] = React.useState(false);

  // Reset values when modal opens with new initial values
  React.useEffect(() => {
    if (isOpen) {
      setTokenSet(initialTokenSet || 'All');
      setStartsWith(initialStartsWith || '');
      setUseRegex(false); // Reset regex mode when modal opens
    }
  }, [isOpen, initialTokenSet, initialStartsWith]);

  // Get resolved tokens using the same pattern as other components, including proper theme configuration
  const resolvedTokens = React.useMemo(() => {
    // Get the active theme IDs (activeTheme is Record<string, string>)
    const activeThemeIds = Object.values(activeTheme || {});

    // Calculate the overall configuration from active themes
    const overallConfig = getOverallConfig(themes, activeThemeIds);

    // Merge tokens with proper theme configuration
    const mergedTokens = mergeTokenGroups(tokens, usedTokenSet, overallConfig, activeTokenSet);

    return defaultTokenResolver.setTokens(mergedTokens);
  }, [tokens, usedTokenSet, activeTokenSet, activeTheme, themes]);

  const handleTokenSetChange = React.useCallback((value: string) => {
    setTokenSet(value);
  }, []);

  const handleStartsWithChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStartsWith(e.target.value);
  }, []);

  const handleApplyTokensChange = React.useCallback((checked: boolean | string) => {
    setApplyTokens(checked === true);
  }, []);

  const handleUseRegexChange = React.useCallback(() => {
    setUseRegex(!useRegex);
  }, [useRegex]);

  const handleGenerate = React.useCallback(() => {
    // Track when user starts creating living documentation with detailed properties
    track('Living Documentation Creation Started', {
      tokenSetChoice: tokenSet === 'All' ? 'ALL' : 'SETS',
      tokenSetCount: tokenSet === 'All' ? allTokenSets.length : 1,
      startsWithFilled: !!startsWith.trim(),
      applyTokensChecked: applyTokens,
      // Track if we started based on a selection (using their template) or no selection (using our template)
      hasUserTemplate: false, // This will be determined in the plugin side
    });

    AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.CREATE_LIVING_DOCUMENTATION,
      tokenSet,
      startsWith,
      applyTokens,
      resolvedTokens,
      useRegex,
    });
    onClose();
  }, [tokenSet, startsWith, applyTokens, resolvedTokens, onClose, allTokenSets.length, useRegex]);

  return (
    <Modal title={t('generateDocumentation')} isOpen={isOpen} close={onClose} size="large">
      <Stack direction="column" gap={4}>
        <Stack direction="column" gap={3}>
          <Text size="small" muted>
            Generate living documentation to showcase your design tokens in Figma.
            {' '}
            <a
              href="https://docs.tokens.studio/figma/generate-documentation"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '$accent', textDecoration: 'underline' }}
            >
              Learn more
            </a>
          </Text>
          <Text size="small" muted>
            Use our preset template, or select a custom template frame with layers named with properties like
            {' '}
            <StyledCode>__tokenName</StyledCode>
            ,
            {' '}
            <StyledCode>__value</StyledCode>
            ,
            {' '}
            <StyledCode>__tokenValue</StyledCode>
            , etc.
          </Text>
        </Stack>
        <Stack direction="column" gap={2}>
          <label htmlFor="tokenSet">{t('tokenSetRequired')}</label>
          <Select value={tokenSet} onValueChange={handleTokenSetChange}>
            <Select.Trigger value={tokenSet} />
            <Select.Content>
              <Select.Item value="All">{t('all')}</Select.Item>
              {allTokenSets.map((set) => (
                <Select.Item key={set} value={set}>
                  {set}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </Stack>
        <Stack direction="column" gap={2}>
          <FormField>
            <Label>{useRegex ? t('nameMatchesPattern') : t('nameStartsWith')}</Label>
            <TextInput
              value={startsWith}
              onChange={handleStartsWithChange}
              placeholder={useRegex ? 'color\\.(primary|secondary) (regex active)' : 'color'}
              trailingAction={<IconButton tooltip={useRegex ? 'Disable regex' : 'Enable regex'} size="small" onClick={handleUseRegexChange} icon={<Asterisk />} variant={useRegex ? 'primary' : 'invisible'} />}
            />
          </FormField>
        </Stack>
        <Stack direction="row" gap={3} align="center" css={{ width: '100%' }}>
          <Label htmlFor="apply-tokens">{t('applyTokensToCreatedLayers')}</Label>
          <Switch id="apply-tokens" checked={applyTokens} onCheckedChange={handleApplyTokensChange} />
        </Stack>
        <Stack direction="row" justify="end" gap={4}>
          <Button variant="secondary" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button variant="primary" onClick={handleGenerate} disabled={!tokenSet.trim()}>
            {t('generate')}
          </Button>
        </Stack>
      </Stack>
    </Modal>
  );
}

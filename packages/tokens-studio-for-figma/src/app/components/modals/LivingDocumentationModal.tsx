import React from 'react';
import {
  Button, Stack, Select, Switch, Label, Text, ToggleGroup,
} from '@tokens-studio/ui';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { styled } from '@/stitches.config';
import Modal from '../Modal';
import Input from '../Input';
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

const StyledWarning = styled('div', {
  backgroundColor: '$dangerBg',
  color: '$dangerFg',
  padding: '$3',
  borderRadius: '$small',
  fontSize: '$small',
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
  const [useUserTemplate, setUseUserTemplate] = React.useState(false);

  // Reset values when modal opens with new initial values
  React.useEffect(() => {
    if (isOpen) {
      setTokenSet(initialTokenSet || 'All');
      setStartsWith(initialStartsWith || '');
      setUseUserTemplate(false);
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

  const handleTemplateToggle = React.useCallback((value: string) => {
    const useUser = value === 'own';
    setUseUserTemplate(useUser);
  }, []);

  const handleGenerate = React.useCallback(() => {
    // Check if we need user selection but don't have it
    if (useUserTemplate) {
      // We'll let the plugin handle this check since we can't access figma.currentPage.selection from UI
      // The plugin will show appropriate error if no selection
    }

    // Track when user starts creating living documentation with detailed properties
    track('Living Documentation Creation Started', {
      tokenSetChoice: tokenSet === 'All' ? 'ALL' : 'SETS',
      tokenSetCount: tokenSet === 'All' ? allTokenSets.length : 1,
      startsWithFilled: !!startsWith.trim(),
      applyTokensChecked: applyTokens,
      // Track template choice
      useUserTemplate,
    });

    AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.CREATE_LIVING_DOCUMENTATION,
      tokenSet,
      startsWith,
      applyTokens,
      resolvedTokens,
      useUserTemplate,
    });
    onClose();
  }, [tokenSet, startsWith, applyTokens, resolvedTokens, useUserTemplate, onClose, allTokenSets.length]);

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
          <Text size="small">Template choice</Text>
          <ToggleGroup
            type="single"
            value={useUserTemplate ? 'own' : 'preset'}
            onValueChange={handleTemplateToggle}
          >
            <ToggleGroup.Item iconOnly={false} value="preset">
              {t('useTemplate')}
            </ToggleGroup.Item>
            <ToggleGroup.Item iconOnly={false} value="own">
              {t('useOwnTemplate')}
            </ToggleGroup.Item>
          </ToggleGroup>
          {useUserTemplate && (
            <StyledWarning>
              {t('templateSelectionWarning')}
            </StyledWarning>
          )}
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
        <Input full label={t('nameStartsWith')} value={startsWith} onChange={handleStartsWithChange} />
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

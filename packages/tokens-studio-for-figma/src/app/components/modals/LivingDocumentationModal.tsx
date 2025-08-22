import React from 'react';
import {
  Button, Stack, Select, Switch, Label,
} from '@tokens-studio/ui';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import Modal from '../Modal';
import Input from '../Input';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import {
  allTokenSetsSelector, tokensSelector, usedTokenSetSelector, activeTokenSetSelector,
  activeThemeSelector, themesListSelector,
} from '@/selectors';
import { mergeTokenGroups, getOverallConfig } from '@/utils/tokenHelpers';
import { defaultTokenResolver } from '@/utils/TokenResolver';
import { track } from '@/utils/analytics';

type Props = { isOpen: boolean; onClose: () => void };

export default function LivingDocumentationModal({ isOpen, onClose }: Props) {
  const { t } = useTranslation(['tokens']);
  const allTokenSets = useSelector(allTokenSetsSelector);
  const tokens = useSelector(tokensSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const activeTokenSet = useSelector(activeTokenSetSelector);
  const activeTheme = useSelector(activeThemeSelector);
  const themes = useSelector(themesListSelector);
  const [tokenSet, setTokenSet] = React.useState('All');
  const [startsWith, setStartsWith] = React.useState('');
  const [applyTokens, setApplyTokens] = React.useState(true);

  React.useEffect(() => {
    if (isOpen) {
      track('Living Documentation Modal Opened');
    }
  }, [isOpen]);

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
    });
    onClose();
  }, [tokenSet, startsWith, applyTokens, resolvedTokens, onClose, allTokenSets.length]);

  return (
    <Modal title={t('generateDocumentation')} isOpen={isOpen} close={onClose} size="large">
      <Stack direction="column" gap={4}>
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

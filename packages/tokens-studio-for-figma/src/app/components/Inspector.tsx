import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Tooltip } from '@tokens-studio/ui';
import Box from './Box';
import InspectorDebugView from './InspectorDebugView';
import InspectorMultiView from './InspectorMultiView';
import IconDebug from '@/icons/debug.svg';
import IconInspect from '@/icons/multiinspect.svg';
import IconButton from './IconButton';
import { Dispatch } from '../store';
import Checkbox from './Checkbox';
import Label from './Label';
import { mergeTokenGroups } from '@/utils/tokenHelpers';
import { track } from '@/utils/analytics';
import {
  inspectDeepSelector,
  tokensSelector,
  usedTokenSetSelector,
} from '@/selectors';
import Input from './Input';
import InspectSearchOptionDropdown from './InspectSearchOptionDropdown';
import Stack from './Stack';
import { defaultTokenResolver } from '@/utils/TokenResolver';

function Inspector() {
  const [inspectView, setInspectView] = React.useState('multi');
  const { t } = useTranslation(['inspect']);
  const [searchInputValue, setSearchInputValue] = React.useState<string>('');
  const dispatch = useDispatch<Dispatch>();
  const tokens = useSelector(tokensSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const inspectDeep = useSelector(inspectDeepSelector);
  // TODO: Put this into state in a performant way
  const resolvedTokens = React.useMemo(() => (
    defaultTokenResolver.setTokens(mergeTokenGroups(tokens, usedTokenSet))
  ), [tokens, usedTokenSet]);

  const handleSetInspectViewMulti = React.useCallback(() => {
    setInspectView('multi');
    track('setInspectView', { view: 'multi' });
  }, []);

  const handleSetInspectViewDebug = React.useCallback(() => {
    setInspectView('debug');
    track('setInspectView', { view: 'debug' });
  }, []);

  function renderInspectView() {
    switch (inspectView) {
      case 'debug': return <InspectorDebugView resolvedTokens={resolvedTokens} />;
      case 'multi': return <InspectorMultiView resolvedTokens={resolvedTokens} tokenToSearch={searchInputValue} />;
      default: return null;
    }
  }

  const handleSearchInputChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInputValue(event.target.value);
  }, []);

  const handleSetInspectDeep = React.useCallback(() => dispatch.settings.setInspectDeep(!inspectDeep), [dispatch, inspectDeep]);

  return (
    <Box css={{
      gap: '$2', flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden',
    }}
    >
      <Box css={{
        display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '$2', padding: '$4', borderBottom: '1px solid $borderMuted',
      }}
      >
        <Box
          css={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '$3',
          }}
        >
          <Input
            full
            value={searchInputValue}
            onChange={handleSearchInputChange}
            type="text"
            autofocus
            placeholder={`${t('search')}...`}
          />
        </Box>
        <Stack direction="row" align="center" gap={4}>
          <Stack direction="row" align="center" gap={2}>
            <Checkbox
              checked={inspectDeep}
              id="inspectDeep"
              onCheckedChange={handleSetInspectDeep}
            />
            <Tooltip label={t('scansSelected') as string} side="bottom">
              <Label htmlFor="inspectDeep">
                <Box css={{ fontWeight: '$sansBold', fontSize: '$small' }}>
                  {t('deepInspect')}
                </Box>
              </Label>
            </Tooltip>
          </Stack>
          <Stack direction="row">
            <IconButton
              variant={inspectView === 'multi' ? 'primary' : 'invisible'}
              dataCy="inspector-multi"
              onClick={handleSetInspectViewMulti}
              icon={<IconInspect />}
              tooltipSide="bottom"
              tooltip={t('inspectLayers') as string}
            />
            <IconButton
              variant={inspectView === 'debug' ? 'primary' : 'invisible'}
              dataCy="inspector-debug"
              onClick={handleSetInspectViewDebug}
              icon={<IconDebug />}
              tooltipSide="bottom"
              tooltip={t('debugAndAnnotate') as string}
            />
          </Stack>
          <InspectSearchOptionDropdown />
        </Stack>
      </Box>
      {renderInspectView()}
    </Box>
  );
}

export default Inspector;

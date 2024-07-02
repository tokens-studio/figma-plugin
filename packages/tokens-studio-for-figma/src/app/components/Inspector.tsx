import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Checkbox, TextInput, ToggleGroup, Tooltip,
} from '@tokens-studio/ui';
import { Search } from 'iconoir-react';
import Box from './Box';
import InspectorDebugView from './InspectorDebugView';
import InspectorMultiView from './InspectorMultiView';
import IconDebug from '@/icons/debug.svg';
import IconInspect from '@/icons/multiinspect.svg';
import { Dispatch } from '../store';
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

  const handleSetInspectView = React.useCallback((view: 'multi' | 'debug') => {
    if (view) {
      track('setInspectView', { view });
      setInspectView(view);
    }
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
        display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '$2', padding: '$2', borderBottom: '1px solid $borderMuted',
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
          <TextInput
            value={searchInputValue}
            onChange={handleSearchInputChange}
            type="text"
            placeholder={`${t('search')}…`}
            leadingVisual={<Search />}
          />
        </Box>
        <Stack direction="row" align="center" gap={2}>
          <Stack direction="row" align="center">
            <Checkbox
              checked={inspectDeep}
              id="inspectDeep"
              onCheckedChange={handleSetInspectDeep}
            />
            <Tooltip label={t('scansSelected') as string} side="bottom">
              <Label htmlFor="inspectDeep">
                <Box css={{
                  fontWeight: '$sansBold', fontSize: '$xsmall', padding: '$2',
                }}
                >
                  {t('deepInspect')}
                </Box>
              </Label>
            </Tooltip>
          </Stack>
          <InspectSearchOptionDropdown />
          <ToggleGroup
            size="small"
            type="single"
            value={inspectView}
            onValueChange={handleSetInspectView}
          >
            {/* Disabling tooltip for now due to https://github.com/radix-ui/primitives/issues/602
            <ToggleGroup.Item value="multi" tooltip={t('inspectLayers') as string} tooltipSide="bottom"> */}
            <ToggleGroup.Item value="multi">
              <IconInspect />
            </ToggleGroup.Item>
            {/* Disabling tooltip for now due to https://github.com/radix-ui/primitives/issues/602
              <ToggleGroup.Item value="debug" tooltip={t('debugAndAnnotate') as string} tooltipSide="bottom"> */}
            <ToggleGroup.Item value="debug">
              <IconDebug />
            </ToggleGroup.Item>
          </ToggleGroup>
        </Stack>
      </Box>
      {renderInspectView()}
    </Box>
  );
}

export default Inspector;

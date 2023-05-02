import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Box from './Box';
import InspectorDebugView from './InspectorDebugView';
import InspectorMultiView from './InspectorMultiView';
import IconDebug from '@/icons/debug.svg';
import IconInspect from '@/icons/multiinspect.svg';
import IconButton from './IconButton';
import { Dispatch } from '../store';
import Checkbox from './Checkbox';
import Label from './Label';
import Tooltip from './Tooltip';
import { resolveTokenValues, mergeTokenGroups } from '@/plugin/tokenHelpers';
import { track } from '@/utils/analytics';
import {
  activeTokenSetSelector,
  inspectDeepSelector,
  tokensSelector,
  usedTokenSetSelector,
} from '@/selectors';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import Input from './Input';
import InspectSearchOptionDropdown from './InspectSearchOptionDropdown';
import Stack from './Stack';

function Inspector() {
  const [inspectView, setInspectView] = React.useState('multi');
  const [searchInputValue, setSearchInputValue] = React.useState<string>('');
  const dispatch = useDispatch<Dispatch>();
  const tokens = useSelector(tokensSelector);
  const activeTokenSet = useSelector(activeTokenSetSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const inspectDeep = useSelector(inspectDeepSelector);
  // TODO: Put this into state in a performant way
  const resolvedTokens = React.useMemo(() => (
    resolveTokenValues(mergeTokenGroups(tokens, {
      ...usedTokenSet,
      [activeTokenSet]: TokenSetStatus.ENABLED,
    }))
  ), [tokens, usedTokenSet, activeTokenSet]);

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
            placeholder="Search..."
          />
        </Box>
        <Stack direction="row" align="center" gap={4}>
          <Stack direction="row" align="center" gap={2}>
            <Checkbox
              checked={inspectDeep}
              id="inspectDeep"
              onCheckedChange={handleSetInspectDeep}
            />
            <Tooltip label="Scans selected layer and all of its children" side="bottom">
              <Label htmlFor="inspectDeep">
                <Box css={{ fontWeight: '$bold', fontSize: '$small', marginBottom: '$1' }}>Deep inspect</Box>
              </Label>
            </Tooltip>
          </Stack>
          <Stack direction="row">
            <IconButton
              variant={inspectView === 'multi' ? 'primary' : 'default'}
              dataCy="inspector-multi"
              onClick={handleSetInspectViewMulti}
              icon={<IconInspect />}
              tooltipSide="bottom"
              tooltip="Inspect layers"
            />
            <IconButton
              variant={inspectView === 'debug' ? 'primary' : 'default'}
              dataCy="inspector-debug"
              onClick={handleSetInspectViewDebug}
              icon={<IconDebug />}
              tooltipSide="bottom"
              tooltip="Debug & Annotate"
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

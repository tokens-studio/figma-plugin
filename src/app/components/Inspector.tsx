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
} from '@/selectors';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import convertTokensObjectToResolved from '@/utils/convertTokensObjectToResolved';

function Inspector() {
  const [inspectView, setInspectView] = React.useState('multi');
  const dispatch = useDispatch<Dispatch>();
  const tokens = useSelector(tokensSelector);
  const activeTokenSet = useSelector(activeTokenSetSelector);
  const usedTokenSet = useSelector(convertTokensObjectToResolved);
  const inspectDeep = useSelector(inspectDeepSelector);

  // TODO: Put this into state in a performant way
  const resolvedTokens = React.useMemo(() => (
    resolveTokenValues(mergeTokenGroups(tokens, {
      ...usedTokenSet,
      [activeTokenSet]: TokenSetStatus.ENABLED,
    }))
  ), [tokens, usedTokenSet, activeTokenSet]);

  function handleSetInspectView(view: string) {
    setInspectView(view);
    track('setInspectView', {
      view,
    });
  }

  function renderInspectView() {
    switch (inspectView) {
      case 'debug': return <InspectorDebugView resolvedTokens={resolvedTokens} />;
      case 'multi': return <InspectorMultiView resolvedTokens={resolvedTokens} />;
      default: return null;
    }
  }

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
          <Checkbox
            checked={inspectDeep}
            id="inspectDeep"
            onCheckedChange={() => dispatch.settings.setInspectDeep(!inspectDeep)}
          />
          <Tooltip label="Scans selected layer and all of its children" side="bottom">
            <Label htmlFor="inspectDeep">
              <Box css={{ fontWeight: '$bold', fontSize: '$small', marginBottom: '$1' }}>Deep inspect</Box>
            </Label>
          </Tooltip>
        </Box>
        <Box
          css={{
            display: 'flex', gap: '$2', flexDirection: 'row', alignItems: 'center',
          }}
        >
          <IconButton
            variant={inspectView === 'multi' ? 'primary' : 'default'}
            dataCy="inspector-multi"
            onClick={() => handleSetInspectView('multi')}
            icon={<IconInspect />}
            tooltipSide="bottom"
            tooltip="Inspect layers"
          />
          <IconButton
            variant={inspectView === 'debug' ? 'primary' : 'default'}
            dataCy="inspector-debug"
            onClick={() => handleSetInspectView('debug')}
            icon={<IconDebug />}
            tooltipSide="bottom"
            tooltip="Debug & Annotate"
          />
        </Box>
      </Box>

      {renderInspectView()}
    </Box>
  );
}

export default Inspector;

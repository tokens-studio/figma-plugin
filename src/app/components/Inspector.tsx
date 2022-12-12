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
import Button from './Button';
import BulkRemapModal from './modals/BulkRemapModal';

function Inspector() {
  const [inspectView, setInspectView] = React.useState('multi');
  const [bulkRemapModalVisible, setShowBulkRemapModalVisible] = React.useState(false);
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

  const handleShowBulkRemap = React.useCallback(() => {
    setShowBulkRemapModalVisible(true);
  }, []);

  const handleHideBulkRemap = React.useCallback(() => {
    setShowBulkRemapModalVisible(false);
  }, []);

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
            display: 'flex', gap: '$4', flexDirection: 'row', alignItems: 'center',
          }}
        >
          <Button onClick={handleShowBulkRemap} variant="secondary">
            Bulk remap
          </Button>
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
        {bulkRemapModalVisible && (
        <BulkRemapModal
          isOpen={bulkRemapModalVisible}
          onClose={handleHideBulkRemap}
        />
        )}
      </Box>

      {renderInspectView()}
    </Box>
  );
}

export default Inspector;

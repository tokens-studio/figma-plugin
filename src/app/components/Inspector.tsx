import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Box from './Box';
import InspectorDebugView from './InspectorDebugView';
import InspectorMultiView from './InspectorMultiView';
import IconDebug from '@/icons/debug.svg';
import IconInspect from '@/icons/multiinspect.svg';
import IconButton from './IconButton';
import { Dispatch, RootState } from '../store';
import Checkbox from './Checkbox';
import Label from './Label';
import Tooltip from './Tooltip';

function Inspector() {
  const [inspectView, setInspectView] = React.useState('multi');

  const { inspectDeep } = useSelector((state: RootState) => state.settings);
  const dispatch = useDispatch<Dispatch>();

  function renderInspectView() {
    switch (inspectView) {
      case 'debug': return <InspectorDebugView />;
      case 'multi': return <InspectorMultiView />;
      default: return null;
    }
  }

  return (
    <Box css={{
      gap: '$2', flexGrow: 1, display: 'flex', flexDirection: 'column',
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
        <Box css={{
          display: 'flex', gap: '$2', flexDirection: 'row', alignItems: 'center',
        }}
        >
          <IconButton
            variant={inspectView === 'multi' ? 'primary' : 'default'}
            dataCy="inspector-multi"
            onClick={() => setInspectView('multi')}
            icon={<IconInspect />}
            tooltipSide="bottom"
            tooltip="Inspect layers"
          />
          <IconButton
            variant={inspectView === 'debug' ? 'primary' : 'default'}
            dataCy="inspector-debug"
            onClick={() => setInspectView('debug')}
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

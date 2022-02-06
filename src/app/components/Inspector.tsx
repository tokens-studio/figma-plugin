import * as React from 'react';
import RemapHelper from './RemapHelper';
import Box from './Box';
import InspectorDebugView from './InspectorDebugView';
import InspectorMultiView from './InspectorMultiView';
import IconDebug from '@/icons/debug.svg';
import IconInspect from '@/icons/multiinspect.svg';
import IconButton from './IconButton';

function Inspector() {
  const [viewDebug, setViewDebug] = React.useState(false);
  return (
    <Box css={{
      gap: '$2', flexGrow: 1, display: 'flex', flexDirection: 'column',
    }}
    >
      <Box css={{
        display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '$2', padding: '$4', borderBottom: '1px solid $border',
      }}
      >
        <RemapHelper />
        <Box css={{
          display: 'flex', gap: '$2', flexDirection: 'row', alignItems: 'center',
        }}
        >
          <IconButton
            variant={!viewDebug ? 'primary' : 'default'}
            dataCy="inspector-multi"
            onClick={() => setViewDebug(false)}
            icon={<IconInspect />}
            tooltipSide="bottom"
            tooltip="Inspect layers"
          />
          <IconButton
            variant={viewDebug ? 'primary' : 'default'}
            dataCy="inspector-debug"
            onClick={() => setViewDebug(true)}
            icon={<IconDebug />}
            tooltipSide="bottom"
            tooltip="Debug"
          />
        </Box>
      </Box>

      {viewDebug ? <InspectorDebugView /> : <InspectorMultiView />}
    </Box>
  );
}

export default Inspector;

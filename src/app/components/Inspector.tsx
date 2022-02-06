import * as React from 'react';
import AnnotationBuilder from './AnnotationBuilder';
import RemapHelper from './RemapHelper';
import Box from './Box';
import InspectorDebugView from './InspectorDebugView';
import InspectorMultiView from './InspectorMultiView';
import Button from './Button';

function Inspector() {
  const [viewDebug, setViewDebug] = React.useState(false);
  return (
    <Box css={{
      gap: '$2', padding: '$4', flexGrow: 1, display: 'flex', flexDirection: 'column',
    }}
    >
      <Button
        onClick={() => setViewDebug(!viewDebug)}
        variant="secondary"
      >
        Debug

      </Button>
      <AnnotationBuilder />
      <RemapHelper />
      {viewDebug ? <InspectorDebugView /> : <InspectorMultiView />}
    </Box>
  );
}

export default Inspector;

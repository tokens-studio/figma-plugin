import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { SelectionGroup, SelectionValue } from '@/types/tokens';
import { RootState, Dispatch } from '../store';
import useTokens from '../store/useTokens';
import Button from './Button';
import AnnotationBuilder from './AnnotationBuilder';
import RemapHelper from './RemapHelper';
import IconLayers from '@/icons/layers.svg';
import Box from './Box';
import Checkbox from './Checkbox';
import Heading from './Heading';
import Label from './Label';
import Blankslate from './Blankslate';
import InspectorDebugView from './InspectorDebugView';
import InspectorMultiView from './InspectorMultiView';

function renderResolvedtoken(token) {
  if (!token) return null;
  switch (token?.type) {
    case 'color': {
      return (
        <Box
          css={{
            background: token.value,
            width: '24px',
            height: '24px',
            borderRadius: '100%',
          }}
        />
      );
    }
    case 'typography': {
      return (
        <Box
          css={{
            background: '$bgSubtle',
            fontSize: '$small',
            padding: '$2 $3',
            borderRadius: '$default',
            width: '40px',
          }}
        >
          aA
        </Box>
      );
    }
    case 'boxShadow': {
      return (
        <Box
          css={{
            background: '$bgSubtle',
            fontSize: '$small',
            padding: '$2 $3',
            borderRadius: '$default',
            width: '40px',
          }}
        >
          shd
        </Box>
      );
    }
    default: {
      return (
        <Box
          css={{
            background: '$bgSubtle',
            fontSize: '$small',
            padding: '$2 $3',
            borderRadius: '$default',
            width: '40px',
          }}
        >
          {token.value}
        </Box>
      );
    }
  }
}

function Inspector() {
  return (
    <Box css={{
      gap: '$2', padding: '$4', flexGrow: 1, display: 'flex', flexDirection: 'column',
    }}
    >
      <AnnotationBuilder />
      <RemapHelper />
      {viewDebug ? <InspectorDebugView /> : <InspectorMultiView />}

    </Box>
  );
}

export default Inspector;

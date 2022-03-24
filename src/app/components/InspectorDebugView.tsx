import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import Box from './Box';
import Blankslate from './Blankslate';
import AnnotationBuilder from './AnnotationBuilder';
import { SingleToken } from '@/types/tokens';
import useTokens from '../store/useTokens';

export default function InspectorDebugView({ resolvedTokens }: { resolvedTokens: SingleToken[] }) {
  const uiState = useSelector((state: RootState) => state.uiState);
  const { getTokenValue } = useTokens();

  function renderBlankslate() {
    if (uiState.selectedLayers > 1) return <Blankslate title="More than 1 layer selected" text="Select a single layer to see applied tokens" />;
    return <Blankslate title={uiState.selectedLayers === 1 ? 'No tokens found' : 'No layer selected'} text={uiState.selectedLayers === 1 ? 'Selected layer contains no tokens' : 'Select a layer to see applied tokens'} />;
  }

  return (
    <Box css={{
      display: 'flex', flexDirection: 'column', flexGrow: 1, padding: '$4',
    }}
    >
      <AnnotationBuilder />

      {uiState.selectedLayers === 1 && Object.entries(uiState.mainNodeSelectionValues).length > 0
        ? (
          <div className="space-y-1">
            {Object.entries(uiState.mainNodeSelectionValues)
              .filter(([, value]) => value !== 'delete')
              .map(([property, value]) => (
                <div key={property} className="flex flex-row items-start justify-between">
                  <code className="flex flex-wrap space-x-2">
                    <div className="font-bold">{property}</div>
                    :
                    {' '}
                    <div className="p-1 text-white bg-gray-700 rounded text-xxs">
                      $
                      {typeof value === 'string' && value.split('.').join('-')}
                    </div>
                    <div className="text-gray-500 break-all">{`/* ${JSON.stringify(getTokenValue(value, resolvedTokens))} */`}</div>
                  </code>
                </div>
              ))}
          </div>
        )
        : renderBlankslate()}
    </Box>
  );
}

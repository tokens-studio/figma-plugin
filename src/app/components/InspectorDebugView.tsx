import React from 'react';
import { useSelector } from 'react-redux';
import Box from './Box';
import Blankslate from './Blankslate';
import AnnotationBuilder from './AnnotationBuilder';
import { SingleToken } from '@/types/tokens';
import useTokens from '../store/useTokens';
import { uiStateSelector } from '@/selectors';
import Stack from './Stack';
import { isEqual } from '@/utils/isEqual';
import { StyledInspectBadge } from './StyledInspectBadge';
import Text from './Text';
import { StyleIdBackupKeys } from '@/constants/StyleIdBackupKeys';

export default function InspectorDebugView({ resolvedTokens }: { resolvedTokens: SingleToken[] }) {
  const uiState = useSelector(uiStateSelector, isEqual);
  const { getTokenValue } = useTokens();

  function renderBlankslate() {
    if (uiState.selectedLayers > 1) return <Blankslate title="More than 1 layer selected" text="Select a single layer to see applied tokens" />;
    return <Blankslate title={uiState.selectedLayers === 1 ? 'No tokens found' : 'No layer selected'} text={uiState.selectedLayers === 1 ? 'Selected layer contains no tokens' : 'Select a layer to see applied tokens'} />;
  }

  return (
    <Box
      css={{
        display: 'flex', flexDirection: 'column', flexGrow: 1, padding: '$4',
      }}
      className="content scroll-container"
    >
      <Stack direction="column" css={{ flexGrow: 1 }}>
        <AnnotationBuilder />

        {uiState.selectedLayers === 1 && Object.entries(uiState.mainNodeSelectionValues).length > 0
          ? (
            <Stack direction="column" gap={1}>
              {Object.entries(uiState.mainNodeSelectionValues)
                .filter(([key, value]) => !StyleIdBackupKeys.includes(key) && value !== 'delete')
                .map(([property, value]) => (
                  <Stack key={property} direction="row" align="start" justify="between">
                    <code className="flex flex-wrap space-x-2">
                      <div className="font-bold">{property}</div>
                      :
                      {' '}
                      <StyledInspectBadge>
                        {typeof value === 'string' && value.split('.').join('-')}
                      </StyledInspectBadge>
                      <Text size="xsmall" muted css={{ wordBreak: 'break-all' }}>{`/* ${JSON.stringify(getTokenValue(value, resolvedTokens))} */`}</Text>
                    </code>
                  </Stack>
                ))}
            </Stack>
          )
          : renderBlankslate()}
      </Stack>
    </Box>
  );
}

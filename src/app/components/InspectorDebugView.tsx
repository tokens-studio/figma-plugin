import React, { useCallback } from 'react';
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
import { styled } from '@/stitches.config';

const StyledCode = styled('code', {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '$2',
});

export default function InspectorDebugView({ resolvedTokens }: { resolvedTokens: SingleToken[] }) {
  const uiState = useSelector(uiStateSelector, isEqual);
  const { getTokenValue } = useTokens();

  const getResolvedValue = useCallback((property: string, value: string) => {
    const resolvedToken = getTokenValue(value, resolvedTokens);
    if (resolvedToken) return JSON.stringify(resolvedToken);
    const resolvedValue = uiState.selectionValues.find((item) => item.category === property && item.value === value)?.resolvedValue;
    if (resolvedValue) {
      return JSON.stringify({
        value: resolvedValue,
        type: property,
        name: value,
        rawValue: resolvedValue,
      });
    }
    return undefined;
  }, [getTokenValue, resolvedTokens, uiState.selectionValues]);

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
                    <StyledCode>
                      <Text bold>{property}</Text>
                      :
                      {' '}
                      <StyledInspectBadge>
                        {typeof value === 'string' && value.split('.').join('-')}
                      </StyledInspectBadge>
                      <Text size="xsmall" muted css={{ wordBreak: 'break-all' }}>{`/* ${getResolvedValue(property, value)} */`}</Text>
                    </StyledCode>
                  </Stack>
                ))}
            </Stack>
          )
          : renderBlankslate()}
      </Stack>
    </Box>
  );
}

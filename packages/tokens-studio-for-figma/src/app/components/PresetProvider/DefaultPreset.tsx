import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Button, Heading, Stack, Text, Box,
} from '@tokens-studio/ui';
import { Dispatch } from '@/app/store';
import { track } from '@/utils/analytics';
import { AVAILABLE_PRESETS } from '@/config/presets';
import defaultJSON from '@/config/default.json';
import minimalJSON from '@/config/minimal.json';
import materialJSON from '@/config/material.json';
import modernJSON from '@/config/modern.json';
import parseTokenValues from '@/utils/parseTokenValues';
import { SetTokenDataPayload } from '@/types/payloads';
import { TokenSetStatus } from '@/constants/TokenSetStatus';

type Props = {
  onCancel: () => void;
};

const presetData = {
  'default.json': defaultJSON,
  'minimal.json': minimalJSON,
  'material.json': materialJSON,
  'modern.json': modernJSON,
} as const;



export default function DefaultPreset({ onCancel }: Props) {
  const dispatch = useDispatch<Dispatch>();
  const [selectedPreset, setSelectedPreset] = useState(AVAILABLE_PRESETS[0]);

  const handleSetDefault = React.useCallback(() => {
    track('Load preset', { preset: selectedPreset.id });
    
    // Get the selected preset data
    const selectedPresetData = presetData[selectedPreset.fileName as keyof typeof presetData] || defaultJSON;
    
    // Determine which token sets are available in the preset
    const availableTokenSets = Object.keys(selectedPresetData);
    const usedTokenSet: Record<string, TokenSetStatus> = {};
    
    // Set the first token set as SOURCE and others as ENABLED
    availableTokenSets.forEach((setName, index) => {
      usedTokenSet[setName] = index === 0 ? TokenSetStatus.SOURCE : TokenSetStatus.ENABLED;
    });

    // Load the preset tokens directly
    dispatch.tokenState.setTokenData({
      values: parseTokenValues(selectedPresetData as unknown as SetTokenDataPayload['values']),
      themes: [],
      activeTheme: {},
      usedTokenSet,
    });

    dispatch.tokenState.updateDocument({
      shouldUpdateNodes: false,
      updateRemote: false,
    });
    
    onCancel();
  }, [dispatch, onCancel, selectedPreset]);

  return (
    <Stack direction="column" gap={4}>
      <Stack direction="column" gap={2}>
        <Heading size="small">
          Choose a preset to get started
        </Heading>
        <Text>Select from our curated token presets. Warning: This will override your current tokens!</Text>
      </Stack>
      
      <Stack direction="column" gap={3}>
        {AVAILABLE_PRESETS.map((preset) => (
          <Box
            key={preset.id}
            css={{
              padding: '$3',
              border: selectedPreset.id === preset.id ? '2px solid $colors$accent9' : '1px solid $colors$border',
              borderRadius: '$default',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: '$colors$bgSubtle',
              },
            }}
            onClick={() => setSelectedPreset(preset)}
          >
            <Stack direction="column" gap={1}>
              <Text size="small" css={{ fontWeight: '$fontWeights$medium' }}>{preset.name}</Text>
              <Text size="xsmall" muted>{preset.description}</Text>
            </Stack>
          </Box>
        ))}
      </Stack>

      <Stack direction="row" gap={3} justify="end">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSetDefault}>
          Load {selectedPreset.name}
        </Button>
      </Stack>
    </Stack>
  );
}

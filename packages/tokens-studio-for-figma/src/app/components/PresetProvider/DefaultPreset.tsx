import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Button, Heading, Stack, Text, Box,
} from '@tokens-studio/ui';
import { Dispatch } from '@/app/store';
import { track } from '@/utils/analytics';
import { AVAILABLE_PRESETS } from '@/config/presets';

type Props = {
  onCancel: () => void;
};

// Helper function to set up a preset before loading
const loadSelectedPreset = (dispatch: Dispatch, presetFileName: string) => {
  // For now, we'll use setDefaultTokens and implement preset selection via a different approach
  // Store the selected preset fileName in localStorage for the setDefaultTokens effect to use
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('selectedPreset', presetFileName);
  }
  dispatch.tokenState.setDefaultTokens();
  // Clean up after loading
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('selectedPreset');
  }
};

export default function DefaultPreset({ onCancel }: Props) {
  const dispatch = useDispatch<Dispatch>();
  const [selectedPreset, setSelectedPreset] = useState(AVAILABLE_PRESETS[0]);

  const handleSetDefault = React.useCallback(() => {
    track('Load preset', { preset: selectedPreset.id });
    loadSelectedPreset(dispatch, selectedPreset.fileName);
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

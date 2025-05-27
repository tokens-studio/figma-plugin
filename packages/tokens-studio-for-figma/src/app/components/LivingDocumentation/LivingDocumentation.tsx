import React, { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Box, Button, Heading, Label, Stack, Text, Select, TextInput,
} from '@tokens-studio/ui';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { tokensSelector, uiStateSelector } from '@/selectors';
import { track } from '@/utils/analytics';

function LivingDocumentation() {
  const { t } = useTranslation(['settings']);
  const tokens = useSelector(tokensSelector);
  const uiState = useSelector(uiStateSelector);
  
  const [selectedTokenSet, setSelectedTokenSet] = useState('');
  const [tokenFilter, setTokenFilter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const tokenSetOptions = Object.keys(tokens).map(setName => ({
    label: setName,
    value: setName,
  }));

  const hasSelection = uiState.selectedLayers === 1;

  const handleGenerate = useCallback(async () => {
    if (!selectedTokenSet || !tokenFilter || !hasSelection) {
      return;
    }

    setIsGenerating(true);
    track('Generate Living Documentation', {
      tokenSet: selectedTokenSet,
      filter: tokenFilter,
    });

    try {
      const result = await AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.GENERATE_LIVING_DOCUMENTATION,
        tokenSet: selectedTokenSet,
        startsWith: tokenFilter,
      });

      if (result.success) {
        // Success notification could be added here
        console.log('Living documentation generated successfully');
      } else {
        console.error('Failed to generate living documentation');
      }
    } catch (error) {
      console.error('Error generating living documentation:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedTokenSet, tokenFilter, hasSelection]);

  const canGenerate = selectedTokenSet && tokenFilter && hasSelection && !isGenerating;

  return (
    <Stack direction="column" gap={4} css={{ padding: '0 $4' }}>
      <Heading size="medium">Living Documentation</Heading>
      <Stack
        direction="column"
        gap={4}
        css={{
          border: '1px solid $borderSubtle',
          borderRadius: '$medium',
          padding: '$4',
          width: '100%',
        }}
      >
        <Text css={{ color: '$fgMuted', fontSize: '$small' }}>
          Generate living documentation by selecting a template layer and configuring token filters.
          The template layer will be duplicated for each matching token.
        </Text>

        <Stack direction="column" gap={3}>
          <Stack direction="column" gap={2}>
            <Label htmlFor="tokenSet">Token Set</Label>
            <Select
              id="tokenSet"
              value={selectedTokenSet}
              onValueChange={setSelectedTokenSet}
              placeholder="Select a token set"
            >
              {tokenSetOptions.map(option => (
                <Select.Item key={option.value} value={option.value}>
                  {option.label}
                </Select.Item>
              ))}
            </Select>
          </Stack>

          <Stack direction="column" gap={2}>
            <Label htmlFor="tokenFilter">Token Name Filter (starts with)</Label>
            <TextInput
              id="tokenFilter"
              value={tokenFilter}
              onChange={(e) => setTokenFilter(e.target.value)}
              placeholder="e.g., colors.primary"
            />
          </Stack>

          <Stack direction="column" gap={2}>
            <Label>Template Layer</Label>
            {hasSelection ? (
              <Text css={{ color: '$fgDefault', fontSize: '$small' }}>
                ✓ One layer selected in Figma
              </Text>
            ) : (
              <Text css={{ color: '$fgMuted', fontSize: '$small' }}>
                Please select exactly one layer in Figma to use as a template
              </Text>
            )}
          </Stack>

          <Button
            variant="primary"
            onClick={handleGenerate}
            disabled={!canGenerate}
            css={{ marginTop: '$2' }}
          >
            {isGenerating ? 'Generating...' : 'Generate Documentation'}
          </Button>
        </Stack>

        <Box css={{ marginTop: '$3' }}>
          <Text css={{ color: '$fgMuted', fontSize: '$xsmall', lineHeight: 1.4 }}>
            <strong>How it works:</strong><br />
            1. Select a layer in Figma to use as a template<br />
            2. Choose a token set and filter<br />
            3. The plugin will create a frame with duplicated template layers<br />
            4. Each duplicate will be named after a matching token<br />
            5. Text layers starting with "__" will be populated with token names
          </Text>
        </Box>
      </Stack>
    </Stack>
  );
}

export default LivingDocumentation;

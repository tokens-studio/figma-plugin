import React from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Button, Stack,
} from '@tokens-studio/ui';
import { Dispatch } from '@/app/store';
import { track } from '@/utils/analytics';
import { presets } from '@/constants/presets';
import parseTokenValues from '@/utils/parseTokenValues';
import { SetTokenDataPayload } from '@/types/payloads';
import { ThemeObjectsList } from '@/types';
import useRemoteTokens from '@/app/store/remoteTokens';

type Props = {
  onCancel: () => void;
};

function parseThemeValues(themes: any): ThemeObjectsList {
  return themes;
}

export const PresetPickButton = ({ presetId, onCancel }: { presetId: string, onCancel: () => void }) => {
  const dispatch = useDispatch<Dispatch>();
  const { fetchTokensFromJSON } = useRemoteTokens();

  const handlePresetClick = React.useCallback(() => {
    track('Load preset', { preset: presetId });
    const foundJSON = presets.find((preset) => preset.id === presetId)!.json;
    await fetchTokensFromJSON(foundJSON);
    dispatch.tokenState.setTokenData({
      // We know the preset exists, so we can safely use the non-null assertion operator here
      values: parseTokenValues(foundJSON as unknown as SetTokenDataPayload['values']),
      themes: parseThemeValues(foundJSON.$themes),
      activeTheme: {},
      usedTokenSet: {},
    });
    onCancel();
  }, [dispatch.tokenState, fetchTokensFromJSON, onCancel, presetId]);

  return (
    <Button
      key={presetId}
      onClick={handlePresetClick}
      variant="secondary"
      size="small"
      data-testid={`add-${presetId}-credential`}
    >
      Choose
    </Button>
  );
};

export default function DefaultPreset({ onCancel }: Props) {
  return (
    <Stack direction="column" gap={4}>
      <Stack direction="column" gap={4}>
        {presets.map((preset) => (
          <Stack direction="row" justify="between" align="center" key={preset.id}>
            <Stack direction="column">
              <Box css={{
                color: '$fgDefault', display: 'inline-flex', gap: '$2', alignItems: 'center',
              }}
              >
                {preset.text}
              </Box>
              <Box css={{ color: '$fgMuted' }}>
                {preset.description}
              </Box>
            </Stack>
            <PresetPickButton presetId={preset.id} onCancel={onCancel} />
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}

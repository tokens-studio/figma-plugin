import type { RematchDispatch } from '@rematch/core';
import defaultJSON from '@/config/default.json';
import minimalJSON from '@/config/minimal.json';
import materialJSON from '@/config/material.json';
import modernJSON from '@/config/modern.json';
import type { RootModel } from '@/types/RootModel';
import parseTokenValues from '@/utils/parseTokenValues';
import { SetTokenDataPayload } from '@/types/payloads';
import { TokenSetStatus } from '@/constants/TokenSetStatus';

const presetData = {
  'default.json': defaultJSON,
  'minimal.json': minimalJSON,
  'material.json': materialJSON,
  'modern.json': modernJSON,
} as const;

export function setDefaultTokens(dispatch: RematchDispatch<RootModel>) {
  return (presetFileName?: string): void => {
    // Check if a preset was selected via localStorage (from the preset selection UI)
    let fileName = presetFileName || 'default.json';
    if (typeof window !== 'undefined') {
      const selectedPreset = window.localStorage.getItem('selectedPreset');
      if (selectedPreset) {
        fileName = selectedPreset;
      }
    }
    
    const selectedPreset = presetData[fileName as keyof typeof presetData] || defaultJSON;
    
    // Determine which token sets are available in the preset
    const availableTokenSets = Object.keys(selectedPreset);
    const usedTokenSet: Record<string, TokenSetStatus> = {};
    
    // Set the first token set as SOURCE and others as ENABLED
    availableTokenSets.forEach((setName, index) => {
      usedTokenSet[setName] = index === 0 ? TokenSetStatus.SOURCE : TokenSetStatus.ENABLED;
    });

    dispatch.tokenState.setTokenData({
      values: parseTokenValues(selectedPreset as unknown as SetTokenDataPayload['values']),
      themes: [],
      activeTheme: {},
      usedTokenSet,
    });

    dispatch.tokenState.updateDocument({
      shouldUpdateNodes: false,
      updateRemote: false,
    });
  };
}

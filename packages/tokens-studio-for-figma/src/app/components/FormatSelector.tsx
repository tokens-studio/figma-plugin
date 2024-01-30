import React from 'react';
import {
  Stack, ToggleGroup,
} from '@tokens-studio/ui';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from '../store';
import { TokenFormatOptions } from '@/plugin/TokenFormatStoreClass';
import { tokenFormatSelector } from '@/selectors/tokenFormatSelector';

export function FormatSelector() {
  const tokenFormat = useSelector(tokenFormatSelector);
  const dispatch = useDispatch<Dispatch>();

  const isDTCG = tokenFormat === TokenFormatOptions.DTCG;

  const handleValueChange = React.useCallback((value: TokenFormatOptions) => {
    dispatch.tokenState.setTokenFormat(value);
  }, [dispatch.tokenState]);

  return (
    <Stack align="center" gap={2}>
      <ToggleGroup size="small" type="single" value={isDTCG ? TokenFormatOptions.DTCG : TokenFormatOptions.Legacy} onValueChange={handleValueChange}>
        <ToggleGroup.Item iconOnly={false} value={TokenFormatOptions.Legacy}>
          Legacy
        </ToggleGroup.Item>
        <ToggleGroup.Item iconOnly={false} value={TokenFormatOptions.DTCG}>
          DTCG
        </ToggleGroup.Item>
      </ToggleGroup>
    </Stack>
  );
}

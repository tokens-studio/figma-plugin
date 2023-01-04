import React from 'react';
import { useDispatch } from 'react-redux';
import { Dispatch } from '@/app/store';
import Button from '../Button';
import Stack from '../Stack';
import Heading from '../Heading';
import Text from '../Text';
import { track } from '@/utils/analytics';

type Props = {
  onCancel: () => void;
};

export default function DefaultPreset({ onCancel }: Props) {
  const dispatch = useDispatch<Dispatch>();
  const handleSetDefault = React.useCallback(() => {
    track('Load preset');
    dispatch.tokenState.setDefaultTokens();
    onCancel();
  }, [dispatch, onCancel]);

  return (
    <Stack direction="column" gap={4}>
      <Stack direction="column" gap={2}>
        <Heading size="small">
          Override your current tokens by applying a preset.
        </Heading>
        <Text>The preset contains a wide variety of tokens and some token sets to give you an idea of what you can do. Warning: This will override your tokens!</Text>
      </Stack>
      <Stack direction="row" gap={2} justify="end">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSetDefault}>
          Load Preset
        </Button>
      </Stack>
    </Stack>
  );
}

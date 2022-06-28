import React from 'react';
import { useDispatch } from 'react-redux';
import { Dispatch } from '@/app/store';
import Button from '../Button';
import Stack from '../Stack';
import Heading from '../Heading';

type Props = {
  onCancel: () => void;
};

export default function DefaultPreset({ onCancel }: Props) {
  const dispatch = useDispatch<Dispatch>();
  const handleSetDefault = React.useCallback(() => {
    dispatch.tokenState.setDefaultTokens();
    onCancel();
  }, [dispatch, onCancel]);

  return (
    <Stack direction="column" gap={4}>
      <Heading size="small">
        Override your current tokens by applying a preset. Want your preset featured here? Submit it via
        {' '}
        <a
          target="_blank"
          rel="noreferrer"
          className="underline"
          href="https://github.com/six7/figma-tokens/issues"
        >
          GitHub
        </a>
      </Heading>
      <Stack direction="row" gap={4} justify="between">
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

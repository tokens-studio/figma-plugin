import React from 'react';
import { useSelector } from 'react-redux';
import useTokens from '@/app/store/useTokens';
import Button from '../Button';
import Stack from '../Stack';
import Heading from '../Heading';
import { IconFile } from '@/icons';
import Box from '../Box';
import { tokensSelector } from '@/selectors';

type Props = {
  onCancel: () => void;
};

export default function MultiFilesExport({ onCancel }: Props) {
  const tokens = useSelector(tokensSelector);
  const { getTokenKeys } = useTokens();

  return (
    <Stack direction="column" gap={4}>
      <Heading size="small">Preview</Heading>
      <Stack direction='column' gap={3} css={{ height: '80px' }}>
        {
          getTokenKeys(tokens).map((key) => (
            <Box>
              <IconFile />
              {key}
            </Box>
          ))
        }
      </Stack>
      <Stack width="full" direction="row" justify="end" gap={4}>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          // href={`charset=utf-8,${encodeURIComponent(
          //   'saffasdfasfd'
          // )}`}
          // download=''
          variant="primary"
        >
          Download
        </Button>
      </Stack>
    </Stack>
  );
}

import React from 'react';
import Button from '../Button';
import Stack from '../Stack';
import Heading from '../Heading';
import Textarea from '../Textarea';

type Props = {
  onCancel: () => void;
};

export default function MultiFilesExport({ onCancel }: Props) {
  return (
    <Stack direction="column" gap={4}>
      <Heading size="small">Preview</Heading>
      <Textarea
        rows={10}
        isDisabled
        value=""
      />
      <Stack width="full" direction="row" justify="end" gap={4}>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          // href={`data:text/json;charset=utf-8,${encodeURIComponent(
          //   getFormattedTokens({
          //     includeAllTokens, includeParent, expandTypography, expandShadow,
          //   }),
          // )}`}
          download="tokens.json"
          variant="primary"
        >
          Download
        </Button>
      </Stack>
    </Stack>
  );
}

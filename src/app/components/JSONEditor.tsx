import React from 'react';
import { useSelector } from 'react-redux';
import Textarea from './Textarea';
import Box from './Box';
import { editProhibitedSelector } from '@/selectors';

function JSONEditor({
  stringTokens,
  handleChange,
  hasError,
}: {
  stringTokens: string;
  handleChange: (tokens: string) => void;
  hasError: boolean;
}) {
  const editProhibited = useSelector(editProhibitedSelector);

  return (
    <Box
      css={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        height: '100%',
        position: 'relative',
      }}
    >
      <Textarea
        isDisabled={editProhibited}
        placeholder="Enter JSON"
        rows={21}
        onChange={handleChange}
        value={stringTokens}
        css={{ paddingBottom: hasError ? '$9' : '0' }}
      />
    </Box>
  );
}
export default JSONEditor;

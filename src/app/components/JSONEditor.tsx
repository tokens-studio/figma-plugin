import React from 'react';
import Editor from '@monaco-editor/react';
import Box from './Box';

type Props = {
  stringTokens: string;
  handleChange: (tokens: string) => void;
};

function JSONEditor({
  stringTokens,
  handleChange,
}: Props) {
  const handleJsonEditChange = React.useCallback((value?: string) => {
    if (value) handleChange(value);
  }, [handleChange]);

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
      <Editor
        language="json"
        onChange={handleJsonEditChange}
        value={stringTokens}
      />
    </Box>
  );
}
export default JSONEditor;

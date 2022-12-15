import React from 'react';
import Editor from '@monaco-editor/react';
import Box from './Box';

type Props = {
  stringTokens: string;
  handleChange: (tokens?: string) => void;
};

function JSONEditor({
  stringTokens,
  handleChange,
}: Props) {
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
        options={{
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          formatOnPaste: true,
          formatOnType: true,
          scrollBeyondLastLine: false,
          domReadOnly: true,
        }}
        onChange={handleChange}
        value={stringTokens}
      />
    </Box>
  );
}
export default JSONEditor;

/*
  With monacco:
  we can support:
  - Syntax highlighting
  - Search and highlight within code
  - Collapsable lines / groups (like VSCode)
  - Show errors inline
  bundle size increase: 0.09kb

  With react-ace:
  we can support:
    It seems like that react-ace doesn't work properly in node environments
  bundle size increase: 0.04kb
*/

import React from 'react';
import Editor from '@monaco-editor/react';
import Box from './Box';
import { useShortcut } from '@/hooks/useShortcut';
import useTokens from '../store/useTokens';

type Props = {
  stringTokens: string;
  handleChange: (tokens: string) => void;
};

function JSONEditor({
  stringTokens,
  handleChange,
}: Props) {
  const { handleJSONUpdate } = useTokens();

  const handleJsonEditChange = React.useCallback((value?: string) => {
    if (value) handleChange(value);
  }, [handleChange]);

  const handleSaveShortcut = React.useCallback((event: KeyboardEvent) => {
    if (event.metaKey || event.ctrlKey) {
      handleJSONUpdate(stringTokens);
    }
  }, [handleJSONUpdate, stringTokens]);

  useShortcut(['KeyS'], handleSaveShortcut);

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
        theme="vs-dark"
      />
    </Box>
  );
}
export default JSONEditor;

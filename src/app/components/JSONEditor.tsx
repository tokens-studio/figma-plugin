import React from 'react';
import { useSelector } from 'react-redux';
import Editor, { useMonaco } from '@monaco-editor/react';
import Box from './Box';
import { useShortcut } from '@/hooks/useShortcut';
import { editProhibitedSelector } from '@/selectors';
import useTokens from '../store/useTokens';
import { useFigmaTheme } from '@/hooks/useFigmaTheme';

type Props = {
  stringTokens: string;
  handleChange: (tokens: string) => void;
};

function JSONEditor({
  stringTokens,
  handleChange,
}: Props) {
  const editProhibited = useSelector(editProhibitedSelector);
  const { handleJSONUpdate } = useTokens();
  const { isDarkTheme } = useFigmaTheme();
  const monaco = useMonaco();

  monaco?.languages.json.jsonDefaults.setDiagnosticsOptions({
    schemas: [{
      fileMatch: ['*'],
      uri: 'https://schemas.tokens.studio/latest/tokens-schema.json',
    }],
    enableSchemaRequest: true,
  });

  const handleJsonEditChange = React.useCallback((value: string | undefined) => {
    handleChange(value ?? '');
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
        theme={isDarkTheme ? 'vs-dark' : 'vs-light'}
        options={{
          minimap: {
            enabled: false,
          },
          lineNumbers: 'off',
          fontSize: 11,
          wordWrap: 'on',
          contextmenu: false,
          readOnly: editProhibited,
        }}
      />
    </Box>
  );
}
export default JSONEditor;

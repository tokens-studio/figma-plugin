import React from 'react';
import { useSelector } from 'react-redux';
import Editor, { useMonaco } from '@monaco-editor/react';
import type { editor as MonacoEditor } from 'monaco-editor';
import Box from './Box';
import { useShortcut } from '@/hooks/useShortcut';
import { activeApiProviderSelector, activeTokenSetReadOnlySelector, editProhibitedSelector } from '@/selectors';
import useTokens from '../store/useTokens';
import { useFigmaTheme } from '@/hooks/useFigmaTheme';
import { StorageProviderType } from '@/constants/StorageProviderType';

type Props = {
  stringTokens: string;
  handleChange: (tokens: string) => void;
};

function JSONEditor({
  stringTokens,
  handleChange,
}: Props) {
  const editProhibited = useSelector(editProhibitedSelector);
  const activeTokenSetReadOnly = useSelector(activeTokenSetReadOnlySelector);
  const activeApiProvider = useSelector(activeApiProviderSelector);
  const isTokensStudioProvider = activeApiProvider === StorageProviderType.TOKENS_STUDIO;

  const { handleJSONUpdate } = useTokens();
  const { isDarkTheme } = useFigmaTheme();
  const monaco = useMonaco();
  const editorRef = React.useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const isReadOnly = Boolean(editProhibited || activeTokenSetReadOnly || isTokensStudioProvider);

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

  const handleEditorMount = React.useCallback((editor: MonacoEditor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    editor.updateOptions({ readOnly: isReadOnly });
  }, [isReadOnly]);

  React.useEffect(() => {
    editorRef.current?.updateOptions({ readOnly: isReadOnly });
  }, [isReadOnly]);

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
        onMount={handleEditorMount}
        onChange={handleJsonEditChange}
        value={stringTokens}
        theme={isDarkTheme ? 'vs-dark' : 'vs-light'}
        options={{
          minimap: {
            enabled: false,
          },
          lineNumbers: 'on',
          fontSize: 11,
          wordWrap: 'on',
          contextmenu: false,
          readOnly: isReadOnly,
        }}
      />
    </Box>
  );
}
export default JSONEditor;

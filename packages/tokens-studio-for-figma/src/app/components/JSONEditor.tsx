import React from 'react';
import { useSelector } from 'react-redux';
import Editor, { useMonaco } from '@monaco-editor/react';
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

  // Configure Monaco Editor for enhanced JSON support
  React.useEffect(() => {
    if (monaco) {
      // Define custom JSON schema for design tokens
      const designTokenSchema = {
        type: 'object',
        properties: {
          $themes: {
            type: 'array',
            description: 'Theme definitions for token sets',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                selectedTokenSets: {
                  type: 'object',
                  additionalProperties: { type: 'string', enum: ['source', 'enabled', 'disabled'] },
                },
              },
            },
          },
          $metadata: {
            type: 'object',
            description: 'Metadata for token sets',
            properties: {
              tokenSetOrder: {
                type: 'array',
                items: { type: 'string' },
              },
            },
          },
        },
        patternProperties: {
          '^(?!\\$).*': {
            type: 'object',
            description: 'Token group or token definition',
            oneOf: [
              {
                description: 'Single token with value and type',
                type: 'object',
                properties: {
                  value: {
                    description: 'Token value',
                  },
                  type: {
                    type: 'string',
                    description: 'Token type',
                    enum: [
                      'color', 'dimension', 'fontFamilies', 'fontWeights', 'lineHeights',
                      'fontSizes', 'letterSpacing', 'paragraphSpacing', 'sizing', 'spacing',
                      'borderRadius', 'borderWidth', 'boxShadow', 'opacity', 'typography',
                      'textCase', 'textDecoration', 'border', 'composition', 'asset',
                      'boolean', 'text', 'number', 'other',
                    ],
                  },
                  description: {
                    type: 'string',
                    description: 'Optional description for the token',
                  },
                },
              },
              {
                description: 'DTCG format token with $ prefix',
                type: 'object',
                properties: {
                  $value: {
                    description: 'Token value (DTCG format)',
                  },
                  $type: {
                    type: 'string',
                    description: 'Token type (DTCG format)',
                    enum: [
                      'color', 'dimension', 'fontFamily', 'fontWeight', 'duration', 'cubicBezier',
                      'number', 'string', 'fontSize', 'lineHeight', 'letterSpacing', 'paragraphSpacing',
                      'sizing', 'spacing', 'borderRadius', 'borderWidth', 'boxShadow', 'opacity',
                      'typography', 'textCase', 'textDecoration', 'border', 'composition',
                    ],
                  },
                  $description: {
                    type: 'string',
                    description: 'Optional description for the token',
                  },
                },
              },
              {
                description: 'Nested token group',
                type: 'object',
                additionalProperties: true,
              },
            ],
          },
        },
        additionalProperties: false,
      };

      // Configure JSON language settings with custom schema
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        allowComments: false,
        schemas: [
          {
            fileMatch: ['*'],
            uri: 'http://tokens.studio/design-tokens-schema.json',
            schema: designTokenSchema,
          },
        ],
        enableSchemaRequest: false, // Use inline schema instead of remote
      });

      // Configure JSON language options for better syntax highlighting
      monaco.languages.json.jsonDefaults.setModeConfiguration({
        documentFormattingEdits: false,
        documentRangeFormattingEdits: false,
        completionItems: true,
        hovers: true,
        documentSymbols: true,
        tokens: true,
        colors: true,
        foldingRanges: true,
        diagnostics: true,
      });
    }
  }, [monaco]);

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
          lineNumbers: 'on',
          fontSize: 11,
          wordWrap: 'on',
          contextmenu: false,
          readOnly: editProhibited || activeTokenSetReadOnly || isTokensStudioProvider,
          // Enhanced syntax highlighting options
          colorDecorators: true,
          bracketPairColorization: {
            enabled: true,
          },
          guides: {
            bracketPairs: true,
            bracketPairsHorizontal: true,
            highlightActiveBracketPair: true,
            indentation: true,
          },
          // Enable semantic highlighting
          'semanticHighlighting.enabled': true,
          // Better folding
          folding: true,
          foldingStrategy: 'indentation',
          showFoldingControls: 'mouseover',
          // Better matching brackets
          matchBrackets: 'always',
          // Enhanced JSON specific features
          automaticLayout: true,
        }}
      />
    </Box>
  );
}
export default JSONEditor;

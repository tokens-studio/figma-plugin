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

import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import Box from './Box';
import { useShortcut } from '@/hooks/useShortcut';
import useTokens from '../store/useTokens';
import { TokensContext } from '@/context';

type Props = {
  stringTokens: string;
  handleChange: (tokens: string) => void;
};

function JSONEditor({
  stringTokens,
  handleChange,
}: Props) {
  // const tokensContext = React.useContext(TokensContext);
  // const { handleJSONUpdate } = useTokens();
  const editContainer = useRef<HTMLDivElement>(null);
  // const uri = monaco.Uri.parse('inmemory://test');

  // const handleJsonEditChange = React.useCallback((value?: string) => {
  //   if (value) handleChange(value);
  // }, [handleChange]);

  // const handleSaveShortcut = React.useCallback((event: KeyboardEvent) => {
  //   if (event.metaKey || event.ctrlKey) {
  //     handleJSONUpdate(stringTokens);
  //   }
  // }, [handleJSONUpdate, stringTokens]);

  // useShortcut(['KeyS'], handleSaveShortcut);

  // const validate = (model: monaco.editor.ITextModel) => {
  //   const markers: any[] = [];
  //   const tokens = monaco.editor.tokenize(model.getValue(), 'json');
  //   console.log('tokens', tokens);

  //   // Note something weird is happening on first load with the tokenizer not providing any types
  //   console.log(JSON.stringify(tokens, null, 4));

  //   let lookingForRange = false;
  //   let startColumn = -1;
  //   let startLine = -1;

  //   tokens.forEach((tokensLine, line) => {
  //     tokensLine.forEach((theToken, i) => {
  //       console.log('theToken', theToken);
  //       if (theToken.type === 'string.value.json') {
  //         startLine = line;
  //         startColumn = theToken.offset;
  //         lookingForRange = true;
  //       } else if (lookingForRange) {
  //         const range = {
  //         // Values are not zero indexed
  //           startLineNumber: startLine + 1,
  //           startColumn: startColumn + 1,
  //           endLineNumber: line + 1,
  //           endColumn: theToken.offset + 1,
  //         };
  //         lookingForRange = false;
  //         const value = String(model.getValueInRange(range).trim());
  //         console.log('value', value);

  //         // Determine if property is allowable

  //         if (value.includes('not')) {
  //           markers.push({
  //             message: 'not allowed',
  //             severity: monaco.MarkerSeverity.Error,
  //             ...range,
  //           });
  //         }
  //       }
  //     });
  //   });

  //   monaco.editor.setModelMarkers(model, 'owner', markers);
  // };

  // monaco.editor.onDidCreateModel((model) => {
  //   validate(model);
  // });

  // monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
  //   enableSchemaRequest: true,
  // });

  // const model = monaco.editor.createModel(stringTokens, 'json', uri);

  // model.onDidChangeContent(() => {
  //   validate(model);
  // });

  useEffect(() => {
    if (editContainer.current) {
      console.log('hhh');
      // monaco.editor.create(editContainer.current, {
      //   model,
      // });
    }
  }, []);

  return (
    <Box
      css={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        height: '100%',
        position: 'relative',
      }}
      // ref={editContainer}
    >
      {/* <Editor
        language="json"
        onChange={handleJsonEditChange}
        value={stringTokens}
      /> */}
    </Box>
  );
}
export default JSONEditor;

import React from 'react';
import { useSelector } from 'react-redux';
import Textarea from './Textarea';
import Box from './Box';
import { editProhibitedSelector } from '@/selectors';
import { useShortcut } from '@/hooks/useShortcut';
import useTokens from '../store/useTokens';

type Props = {
  stringTokens: string;
  handleChange: (tokens: string) => void;
  hasError: boolean;
};

function JSONEditor({
  stringTokens,
  handleChange,
  hasError,
}: Props) {
  const editProhibited = useSelector(editProhibitedSelector);
  const { handleJSONUpdate } = useTokens();
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

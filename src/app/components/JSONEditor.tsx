import * as React from 'react';
import { useSelector } from 'react-redux';
import parseTokenValues from '@/utils/parseTokenValues';
import parseJson from '@/utils/parseJson';
import Textarea from './Textarea';
import { RootState } from '../store';
import useTokens from '../store/useTokens';
import Box from './Box';

function JSONEditor({ stringTokens, setStringTokens }: { stringTokens: string, setStringTokens: (tokens: string) => void }) {
  const { tokens, activeTokenSet, editProhibited } = useSelector((state: RootState) => state.tokenState);
  const { tokenType } = useSelector((state: RootState) => state.settings);
  const { getStringTokens } = useTokens();

  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    setError(null);
    setStringTokens(tokenType === 'array' ? JSON.stringify(tokens[activeTokenSet], null, 2) : getStringTokens());
  }, [tokens, activeTokenSet, tokenType]);

  const changeTokens = (val) => {
    setError(null);
    try {
      const parsedTokens = parseJson(val);
      parseTokenValues(parsedTokens);
    } catch (e) {
      setError(`Unable to read JSON: ${JSON.stringify(e)}`);
    }
    setStringTokens(val);
  };

  return (
    <Box css={{
      display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100%',
    }}
    >
      <Textarea
        isDisabled={editProhibited}
        placeholder="Enter JSON"
        rows={21}
        onChange={changeTokens}
        value={stringTokens}
      />
      {error && (
      <div className="w-full p-2 mt-2 text-xs font-bold text-red-700 bg-red-100 rounded">{error}</div>
      )}
    </Box>
  );
}
export default JSONEditor;

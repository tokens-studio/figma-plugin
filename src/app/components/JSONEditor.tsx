import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import parseTokenValues from '@/utils/parseTokenValues';
import { track } from '@/utils/analytics';
import parseJson from '@/utils/parseJson';
import Textarea from './Textarea';
import { Dispatch, RootState } from '../store';
import useTokens from '../store/useTokens';
import useConfirm from '../hooks/useConfirm';
import Box from './Box';

function JSONEditor() {
  const { tokens, activeTokenSet, editProhibited } = useSelector((state: RootState) => state.tokenState);
  const { tokenType } = useSelector((state: RootState) => state.settings);
  const dispatch = useDispatch<Dispatch>();
  const { getStringTokens } = useTokens();
  const { confirm } = useConfirm();

  const [error, setError] = React.useState(null);
  const [stringTokens, setStringTokens] = React.useState(JSON.stringify(tokens[activeTokenSet], null, 2));

  React.useEffect(() => {
    setError(null);
    setStringTokens(tokenType === 'array' ? JSON.stringify(tokens[activeTokenSet], null, 2) : getStringTokens());
  }, [tokens, activeTokenSet, tokenType]);

  const handleUpdate = async () => {
    dispatch.tokenState.setJSONData(stringTokens);
  };

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

import * as React from 'react';
import Textarea from './Textarea';
import {useTokenState, useTokenDispatch} from '../store/TokenContext';
import Button from './Button';

const JSONToken = ({token}: {token: string}) => {
    const {tokenData} = useTokenState();
    const {setStringTokens, setEmptyTokens, setDefaultTokens, updateTokens, setLoading} = useTokenDispatch();
    const [activeToken] = React.useState('options');
    const regex = new RegExp(String.raw`${token}: {.*?},`, 's');
    const value = (' ' + tokenData.tokens[activeToken].values).slice(1);

    const handleUpdate = async () => {
        await setLoading(true);
        updateTokens();
    };
    return (
        <div className="flex flex-col p-4 w-full items-center">
            <Textarea
                placeholder="Enter JSON"
                rows={10}
                hasErrored={tokenData.tokens[activeToken].hasErrored}
                onChange={(val) => setStringTokens({parent: activeToken, tokens: value.replace(regex, val)})}
                value={value.match(regex)[0]}
            />
            <div className="mt-2 flex w-full">
                <div className="space-x-2 flex mr-2">
                    <Button variant="secondary" size="large" onClick={setDefaultTokens}>
                        Reset to Default
                    </Button>
                    <Button variant="secondary" size="large" onClick={setEmptyTokens}>
                        Clear
                    </Button>
                </div>
                <Button variant="primary" size="large" onClick={handleUpdate}>
                    Save & update
                </Button>
            </div>
        </div>
    );
};
export default JSONToken;

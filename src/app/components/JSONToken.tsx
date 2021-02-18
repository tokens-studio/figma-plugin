import * as React from 'react';
import Textarea from './Textarea';
import {useTokenState, useTokenDispatch} from '../store/TokenContext';

const JSONToken = ({token}: {token: string}) => {
    const {tokenData, activeTokenSet} = useTokenState();
    const {setStringTokens} = useTokenDispatch();
    const regex = new RegExp(String.raw`${token}: {.*?},`, 's');
    const value = ` ${tokenData.tokens[activeTokenSet].values}`.slice(1);

    return (
        <div className="flex flex-col p-4 w-full items-center">
            <Textarea
                placeholder="Enter JSON"
                rows={10}
                hasErrored={tokenData.tokens[activeTokenSet].hasErrored}
                onChange={(val) => setStringTokens({parent: activeTokenSet, tokens: value.replace(regex, val)})}
                value={value.match(regex)[0]}
            />
        </div>
    );
};
export default JSONToken;

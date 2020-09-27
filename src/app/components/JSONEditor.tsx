import * as React from 'react';
import Textarea from './Textarea';
import {TokenContext} from '../store/TokenContext';
import Button from './Button';

const JSONEditor = () => {
    const {state, setStringTokens, setDefaultTokens, updateTokens} = React.useContext(TokenContext);
    const [activeToken] = React.useState('options');
    return (
        <div className="space-y-2 p-4">
            <Textarea
                placeholder="Enter JSON"
                rows={20}
                hasErrored={state.tokenData.tokens[activeToken].hasErrored}
                onChange={(val) => setStringTokens({parent: activeToken, tokens: val})}
                value={state.tokenData.tokens[activeToken].values}
            />
            <div className="space-x-2 flex justify-between">
                <Button variant="secondary" size="large" onClick={setDefaultTokens}>
                    Reset to Default
                </Button>
                <Button variant="primary" size="large" onClick={updateTokens}>
                    Save & update
                </Button>
            </div>
        </div>
    );
};
export default JSONEditor;

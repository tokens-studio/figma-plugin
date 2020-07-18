import * as React from 'react';
import Textarea from './Textarea';
import {TokenContext} from '../store/TokenContext';
import Button from './Button';

const JSONEditor = () => {
    const {state, setStringTokens, setDefaultTokens, updateTokens} = React.useContext(TokenContext);
    const [activeToken, setActiveToken] = React.useState('options');
    return (
        <div className="space-y-2">
            <div className="space-x-2">
                {Object.keys(state.tokenData.tokens).map((key) => {
                    return (
                        <Button
                            key={key}
                            variant={activeToken === key ? 'primary' : 'secondary'}
                            onClick={() => setActiveToken(key)}
                        >
                            {key}
                        </Button>
                    );
                })}
            </div>

            <Textarea
                placeholder="Enter JSON"
                rows={20}
                hasErrored={state.tokenData.tokens[activeToken].hasErrored}
                onChange={(val) => setStringTokens({parent: activeToken, tokens: val})}
                value={state.tokenData.tokens[activeToken].values}
            />
            <div className="space-x-2">
                <button className="button" type="button" onClick={updateTokens}>
                    Save & update
                </button>
                <button className="button" type="button" onClick={setDefaultTokens}>
                    Reset to Default
                </button>
            </div>
        </div>
    );
};
export default JSONEditor;

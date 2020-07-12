import * as React from 'react';
import Textarea from './Textarea';
import {TokenContext} from '../store/TokenContext';
import Button from './Button';

const JSONEditor = () => {
    const {state, setStringTokens, setDefaultTokens, updateTokens} = React.useContext(TokenContext);
    const [activeToken, setActiveToken] = React.useState('main');
    return (
        <div className="space-y-2">
            {Object.keys(state.tokens).map((key) => {
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
            <Button variant="ghost" onClick={() => setStringTokens({parent: '2', tokens: '{}'})}>
                New +
            </Button>

            <Textarea
                placeholder="Enter JSON"
                rows={20}
                hasErrored={state.tokens[activeToken].hasErrored}
                onChange={(val) => setStringTokens({parent: activeToken, tokens: val})}
                value={state.tokens[activeToken].values}
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

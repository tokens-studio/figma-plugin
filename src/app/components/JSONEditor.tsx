import * as React from 'react';
import Textarea from './Textarea';

const JSONEditor = ({handlesetStringTokens, stringTokens, error, onUpdate, setDefaultTokens}) => {
    return (
        <div className="space-y-2">
            <Textarea placeholder="Enter JSON" rows={20} onChange={handlesetStringTokens} value={stringTokens} />
            <div>{error}</div>
            <div className="space-x-2">
                <button className="button" type="button" onClick={onUpdate}>
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

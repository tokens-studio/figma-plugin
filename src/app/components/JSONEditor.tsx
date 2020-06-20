import * as React from 'react';
import Textarea from './Textarea';

const JSONEditor = ({handlesetStringTokens, stringTokens, error, onUpdate}) => (
    <div className="space-y-2">
        <Textarea placeholder="Enter JSON" rows={20} onChange={handlesetStringTokens} value={stringTokens} />
        <div>{error}</div>
        <button className="button" type="button" onClick={onUpdate}>
            Save & update
        </button>
    </div>
);
export default JSONEditor;

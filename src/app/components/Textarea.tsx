import * as React from 'react';

const Textarea = ({className = '', hasErrored = false, rows = 2, value, placeholder, isDisabled = false, onChange}) => {
    className = className || '';
    return (
        <>
            <textarea
                rows={rows}
                className={`textarea ${className}`}
                placeholder={placeholder}
                value={value}
                disabled={isDisabled}
                onChange={(event) => onChange && onChange(event.target.value, event)}
            />
            {hasErrored && <div className="text-red-600 font-medium">Invalid values</div>}
        </>
    );
};

export default Textarea;

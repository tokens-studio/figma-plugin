import * as React from 'react';

const Textarea = ({className = '', rows = 2, value, placeholder, isDisabled = false, onChange}) => {
    className = className || '';
    return (
        <textarea
            rows={rows}
            className={`textarea ${className}`}
            placeholder={placeholder}
            value={value}
            disabled={isDisabled}
            onChange={(event) => onChange && onChange(event.target.value, event)}
        />
    );
};

export default Textarea;

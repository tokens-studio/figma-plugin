import * as React from 'react';

const Input = ({name, required = false, tabindex = null, label = null, full, onChange, value, type, custom = ''}) => {
    return (
        <label htmlFor={name} className="text-xxs font-medium block">
            {label ? <div>{label}</div> : null}
            <input
                tabIndex={tabindex}
                type={type}
                value={value}
                className={`input ${full && 'w-full'}`}
                name={name}
                onChange={onChange}
                required={required}
                data-custom={custom}
            />
        </label>
    );
};

export default Input;

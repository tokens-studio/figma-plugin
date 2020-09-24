import * as React from 'react';

const Input = ({name, required = false, tabindex = null, label, full, onChange, value, type}) => (
    <label htmlFor={name} className="text-xxs font-medium block">
        <div>{label}</div>
        <input
            tabIndex={tabindex}
            type={type}
            value={value}
            className={`input ${full && 'w-full'}`}
            name={name}
            onChange={onChange}
            required={required}
        />
    </label>
);

export default Input;

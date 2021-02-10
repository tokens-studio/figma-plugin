import * as React from 'react';

const RadioButton = ({name, group, children, onChange, value, checked = false}) => (
    <div className="radio">
        <input
            id={name}
            type="radio"
            className="radio__button"
            value={value}
            name={group}
            checked={checked}
            onChange={onChange}
        />
        <label htmlFor={name} className="radio__label">
            {children}
        </label>
    </div>
);

export default RadioButton;

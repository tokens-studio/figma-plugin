import * as React from 'react';

type Props = {
    name: string;
    inputRef?: React.MutableRefObject<HTMLInputElement>;
    error?: string;
    required?: boolean;
    tabindex?: number | null;
    label?: string | null;
    full?: boolean;
    value?: string;
    type?: string;
    custom?: string;
    placeholder?: string;
    capitalize?: boolean;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
};

const Input: React.FC<Props> = ({
    name,
    error = '',
    required = false,
    tabindex = null,
    label = null,
    full,
    onChange,
    value,
    type,
    custom = '',
    inputRef = null,
    placeholder = '',
    capitalize = false,
}) => {
    return (
        <label htmlFor={name} className="text-xxs font-medium block">
            <div className="flex items-center justify-between mb-1">
                {label ? <div className={capitalize ? 'capitalize' : null}>{label}</div> : null}
                {error ? <div className="text-red-500 font-bold">{error}</div> : null}
            </div>
            <input
                spellCheck={false}
                tabIndex={tabindex}
                type={type}
                value={value}
                className={`input ${full && 'w-full'}`}
                name={name}
                onChange={onChange}
                required={required}
                data-custom={custom}
                ref={inputRef}
                placeholder={placeholder}
            />
        </label>
    );
};

export default Input;

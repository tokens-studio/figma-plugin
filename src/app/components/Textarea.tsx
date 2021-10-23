import * as React from 'react';

const Textarea = ({
    className = '',
    rows = 2,
    value,
    placeholder,
    isDisabled = false,
    onChange,
}: {
    className?: string;
    rows?: number;
    value: string;
    placeholder?: string;
    isDisabled?: boolean;
    onChange?: Function;
}) => {
    const customClass = className || '';
    return (
        <>
            <textarea
                spellCheck={false}
                rows={rows}
                className={`textarea ${customClass}`}
                placeholder={placeholder}
                value={value}
                disabled={isDisabled}
                onChange={(event) => onChange && onChange(event.target.value, event)}
            />
        </>
    );
};

export default Textarea;

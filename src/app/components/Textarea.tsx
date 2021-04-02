import * as React from 'react';

const Textarea = ({
    className = '',
    hasErrored = false,
    rows = 2,
    value,
    placeholder,
    isDisabled = false,
    onChange,
}: {
    className?: string;
    hasErrored?: boolean;
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
                rows={rows}
                className={`textarea ${customClass}`}
                placeholder={placeholder}
                value={value}
                disabled={isDisabled}
                onChange={(event) => onChange && onChange(event.target.value, event)}
            />
            {hasErrored && <div className="text-red-600 font-medium w-full mt-1">Invalid values</div>}
        </>
    );
};

export default Textarea;

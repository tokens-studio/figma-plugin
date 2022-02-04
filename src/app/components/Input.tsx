import * as React from 'react';

type Props = {
  name: string;
  inputRef?: React.MutableRefObject<HTMLInputElement>;
  error?: string;
  required?: boolean;
  tabindex?: number | null;
  label?: string | null;
  full?: boolean;
  value?: string | number;
  defaultValue?: string | number;
  type?: string;
  custom?: string;
  placeholder?: string;
  capitalize?: boolean;
  prefix?: React.ReactNode;
  step?: string;
  min?: number;
  max?: number;
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
  defaultValue,
  type,
  prefix,
  min,
  max,
  step,
  custom = '',
  inputRef = null,
  placeholder = '',
  capitalize = false,
}) => (
  <label htmlFor={name} className="text-xxs font-medium block">
    {(!!label || !!error) && (
    <div className="flex items-center justify-between mb-1">
      {label ? <div className={capitalize ? 'capitalize' : null}>{label}</div> : null}
      {error ? <div className="text-red-500 font-bold">{error}</div> : null}
    </div>
    )}
    <span className={`flex input ${full ? 'w-full' : ''}`}>
      {!!prefix && <span className="p-2 flex-shrink-0 border-r border-gray-200">{prefix}</span>}
      <input
        className="p-2 grow w-full"
        spellCheck={false}
        tabIndex={tabindex}
        type={type}
        value={value}
        defaultValue={defaultValue}
        name={name}
        onChange={onChange}
        required={required}
        min={min}
        max={max}
        step={step}
        data-custom={custom}
        ref={inputRef}
        placeholder={placeholder}
      />
    </span>
  </label>
);

export default Input;

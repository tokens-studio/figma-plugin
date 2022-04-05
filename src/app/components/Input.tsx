import * as React from 'react';
import { styled } from '@/stitches.config';
import IconVisibility from './icons/IconVisibiltyOn';
import IconVisibilityOff from './icons/IconVisibilityOff';

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
  suffix?: React.ReactNode;
  step?: string;
  min?: number;
  max?: number;
  isMasked?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
};

const StyledIcon = styled('div', {
  width: '20px',
  height: '20px',
  marginRight: '4px',
  marginLeft: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
});

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
  suffix,
  min,
  max,
  step,
  custom = '',
  inputRef = null,
  placeholder = '',
  capitalize = false,
  isMasked = false,
}) => {
  // if isMasked is true, then we need to handle toggle visibility
  const [show, setShow] = React.useState(false);

  const handleVisibility = (e) => {
    e.preventDefault();
    setShow(!show);
    if (inputRef?.current?.type) {
      inputRef.current.type = inputRef?.current?.type === 'password' ? 'text' : 'password';
    }
  };

  return (
    <label htmlFor={name} className="text-xxs font-medium block">
      {(!!label || !!error) && (
        <div className="flex items-center justify-between mb-1">
          {label ? <div className={capitalize ? 'capitalize' : null}>{label}</div> : null}
          {error ? <div className="text-red-500 font-bold">{error}</div> : null}
        </div>
      )}
      <span className={`flex input ${full ? 'w-full' : ''} items-center`}>
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
        {!!suffix && <span>{suffix}</span>}
        {isMasked && (
          <button type="button" className="py-1 mr-2 rounded-full" onClick={handleVisibility}>
            <StyledIcon>{show ? <IconVisibility /> : <IconVisibilityOff />}</StyledIcon>
          </button>
        )}
      </span>
    </label>
  );
};

export default Input;

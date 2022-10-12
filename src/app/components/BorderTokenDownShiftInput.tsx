import React from 'react';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import DownshiftInput from './DownshiftInput';
import { getLabelForProperty } from '@/utils/getLabelForProperty';

export default function BorderTokenDownShiftInput({
  name,
  value,
  type,
  resolvedTokens,
  handleChange,
  setInputValue,
  handleToggleInputHelper,
}: {
  name: string,
  value: string;
  type: string;
  resolvedTokens: ResolveTokenValuesResult[];
  handleChange: React.ChangeEventHandler;
  setInputValue: (newInputValue: string, property: string) => void;
  handleToggleInputHelper?: () => void;
}) {
  const onChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => handleChange(e), [handleChange]);
  const handleBorderDownShiftInputChange = React.useCallback((newInputValue: string) => setInputValue(newInputValue, name), [name, setInputValue]);
  const getIconComponent = React.useMemo(() => getLabelForProperty(name), [name]);
  return (
    <DownshiftInput
      name={name}
      value={value}
      type={type}
      label={getIconComponent}
      inlineLabel
      resolvedTokens={resolvedTokens}
      handleChange={onChange}
      setInputValue={handleBorderDownShiftInputChange}
      placeholder={
        name === 'color' ? '#000000, hsla(), rgba() or {alias}' : `${name} value or {alias}`
      }
      prefix={
        name === 'color' && value && (
          <button
            type="button"
            className="block w-4 h-4 rounded-sm cursor-pointer shadow-border shadow-gray-300 focus:shadow-focus focus:shadow-primary-400"
            style={{ background: value, fontSize: 0 }}
            onClick={handleToggleInputHelper}
          >
            {value}
          </button>
        )
      }
      suffix
    />
  );
}

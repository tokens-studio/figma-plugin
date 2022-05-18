import React from 'react';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import DownshiftInput from './DownshiftInput';
import { TokenBoxshadowValue } from '@/types/values';

export default function SingleBoxShadowDownShiftInput({
  name,
  value,
  type,
  shadowItem,
  resolvedTokens,
  propertyTypes,
  handleChange,
  setInputValue,
  handleToggleInputHelper,
}: {
  name: string,
  value: string;
  type: string;
  shadowItem?: TokenBoxshadowValue;
  resolvedTokens: ResolveTokenValuesResult[];
  propertyTypes: object;
  handleChange: React.ChangeEventHandler;
  setInputValue: (newInputValue: string, property: string) => void;
  handleToggleInputHelper?: () => void;
}) {
  const onChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => handleChange(e), [handleChange]);
  const handleBoxshadowDownShiftInputChange = React.useCallback((newInputValue: string) => setInputValue(newInputValue, name), [name, setInputValue]);
  return (
    <DownshiftInput
      name={name}
      value={value}
      type={type}
      label={name}
      resolvedTokens={resolvedTokens}
      handleChange={onChange}
      setInputValue={handleBoxshadowDownShiftInputChange}
      placeholder={
        name === 'color' ? '#000000, hsla(), rgba() or {alias}' : 'Value or {alias}'
      }
      prefix={
        name === 'color' && shadowItem && (
          <button
            type="button"
            className="block w-4 h-4 rounded-sm cursor-pointer shadow-border shadow-gray-300 focus:shadow-focus focus:shadow-primary-400"
            style={{ background: shadowItem[name as keyof typeof propertyTypes], fontSize: 0 }}
            onClick={handleToggleInputHelper}
          >
            {shadowItem[name as keyof typeof propertyTypes]}
          </button>
        )
      }
      suffix
    />
  );
}

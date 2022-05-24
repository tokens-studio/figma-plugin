import React from 'react';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import DownshiftInput from './DownshiftInput';

export default function SingleTypographyDownShiftInput({
  name,
  value,
  type,
  resolvedTokens,
  handleChange,
  setInputValue,
}: {
  name: string,
  value: string;
  type: string;
  resolvedTokens: ResolveTokenValuesResult[];
  handleChange: React.ChangeEventHandler;
  setInputValue: (newInputValue: string, property: string) => void;
}) {
  const onChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => handleChange(e), [handleChange]);
  const handleBoxshadowDownShiftInputChange = React.useCallback((newInputValue: string) => setInputValue(newInputValue, name), [name, setInputValue]);
  React.useEffect(() => {
    console.log("value", value)
  }, [])
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
      suffix
    />
  );
}

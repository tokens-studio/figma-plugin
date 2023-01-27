import React from 'react';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import DownshiftInput from './DownshiftInput';
import { getLabelForProperty } from '@/utils/getLabelForProperty';

export default function SingleTypographyDownShiftInput({
  name,
  value,
  type,
  resolvedTokens,
  handleChange,
  setInputValue,
  dropDownStatus,
  handleDropDownStatus,
}: {
  name: string,
  value: string;
  type: string;
  resolvedTokens: ResolveTokenValuesResult[];
  handleChange: React.ChangeEventHandler;
  setInputValue: (newInputValue: string, property: string) => void;
  dropDownStatus?: string;
  handleDropDownStatus?: (name: string) => void;
}) {
  const onChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => handleChange(e), [handleChange]);
  const handleBoxshadowDownShiftInputChange = React.useCallback((newInputValue: string) => setInputValue(newInputValue, name), [name, setInputValue]);

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
      setInputValue={handleBoxshadowDownShiftInputChange}
      placeholder={`${name} value or {alias}`}
      suffix
      handleDropDownStatus={handleDropDownStatus}
      dropDownStatus={dropDownStatus}
    />
  );
}

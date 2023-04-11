import React from 'react';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import DownshiftInput from './DownshiftInput';
import { getLabelForProperty } from '@/utils/getLabelForProperty';

export default function SingleTypographyDownShiftInput({
  name,
  value,
  type,
  resolvedTokens,
  externalFontFamily,
  handleChange,
  setInputValue,
}: {
  name: string,
  value: string;
  type: string;
  resolvedTokens: ResolveTokenValuesResult[];
  externalFontFamily?: string;
  handleChange: React.ChangeEventHandler;
  setInputValue: (newInputValue: string, property: string) => void;
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
      externalFontFamily={externalFontFamily}
      handleChange={onChange}
      setInputValue={handleBoxshadowDownShiftInputChange}
      placeholder={`${name} value or {alias}`}
      suffix
    />
  );
}

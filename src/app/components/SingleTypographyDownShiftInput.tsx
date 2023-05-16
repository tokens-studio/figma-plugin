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
  onSubmit,
}: {
  name: string,
  value: string;
  type: string;
  resolvedTokens: ResolveTokenValuesResult[];
  externalFontFamily?: string;
  handleChange: (property: string, value: string) => void;
  setInputValue: (newInputValue: string, property: string) => void;
  onSubmit: () => void
}) {
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
      handleChange={handleChange}
      setInputValue={handleBoxshadowDownShiftInputChange}
      placeholder={`${name} value or {alias}`}
      suffix
      onSubmit={onSubmit}
    />
  );
}

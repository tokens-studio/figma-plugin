import React from 'react';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import DownshiftInput from './DownshiftInput';
import { StyledIconDisclosure, StyledInputSuffix } from './StyledInputSuffix';

export default function SingleTypographyDownShiftInput({
  name,
  keyIndex,
  showAutoSuggest,
  value,
  type,
  resolvedTokens,
  handleChange,
  setShowAutoSuggest,
  setInputValue,
  handleAutoSuggest,
}: {
  name: string,
  keyIndex: number;
  showAutoSuggest: boolean;
  value: string;
  type: string;
  resolvedTokens: ResolveTokenValuesResult[];
  handleChange: React.ChangeEventHandler;
  setShowAutoSuggest: (keyIndex: number) => void;
  setInputValue: (newInputValue: string, property: string) => void;
  handleAutoSuggest: (keyIndex: number) => void;
}) {
  const onChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => handleChange(e), [handleChange]);
  const handleCloseAutoSuggest = React.useCallback(() => setShowAutoSuggest(keyIndex), [setShowAutoSuggest, keyIndex]);
  const handleBoxshadowDownShiftInputChange = React.useCallback((newInputValue: string) => setInputValue(newInputValue, name), [name, setInputValue]);
  const changeAutoSuggest = React.useCallback(() => handleAutoSuggest(keyIndex), [keyIndex, handleAutoSuggest]);
  return (
    <DownshiftInput
      name={name}
      value={value}
      type={type}
      label={name}
      showAutoSuggest={showAutoSuggest}
      resolvedTokens={resolvedTokens}
      handleChange={onChange}
      setShowAutoSuggest={handleCloseAutoSuggest}
      setInputValue={handleBoxshadowDownShiftInputChange}
      placeholder={
        name === 'color' ? '#000000, hsla(), rgba() or {alias}' : 'Value or {alias}'
      }
      suffix={(
        <StyledInputSuffix type="button" onClick={changeAutoSuggest}>
          <StyledIconDisclosure />
        </StyledInputSuffix>
      )}
    />
  );
}

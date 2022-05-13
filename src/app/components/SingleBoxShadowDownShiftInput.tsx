import React from 'react';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import DownshiftInput from './DownshiftInput';
import { StyledIconDisclosure, StyledInputSuffix } from './StyledInputSuffix';
import { TokenBoxshadowValue } from '@/types/values';

const propertyTypes = {
  x: 'sizing',
  y: 'sizing',
  blur: 'sizing',
  spread: 'sizing',
  color: 'color',
};

export default function SingleBoxShadowDownShiftInput({
  name,
  keyIndex,
  showAutoSuggest,
  value,
  type,
  shadowItem,
  resolvedTokens,
  handleChange,
  setShowAutoSuggest,
  setInputValue,
  handleToggleInputHelper,
  handleAutoSuggest,
}: {
  name: string,
  keyIndex: number;
  showAutoSuggest: boolean;
  value: string;
  type: string;
  shadowItem?: TokenBoxshadowValue;
  resolvedTokens: ResolveTokenValuesResult[];
  handleChange: React.ChangeEventHandler;
  setShowAutoSuggest: (keyIndex: number) => void;
  setInputValue: (newInputValue: string, property: string) => void;
  handleToggleInputHelper?: () => void;
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
      suffix={(
        <StyledInputSuffix type="button" onClick={changeAutoSuggest}>
          <StyledIconDisclosure />
        </StyledInputSuffix>
      )}
    />
  );
}

import React from 'react';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import DownshiftInput from './DownshiftInput';
import { styled } from '@/stitches.config';

const StyledButton = styled('button', {
  display: 'block',
  width: '1.5rem',
  height: '1.5rem',
  borderRadius: '$default',
  cursor: 'pointer',
});

export default function SingleBoxShadowDownShiftInput({
  name,
  value,
  type,
  resolvedTokens,
  handleChange,
  setInputValue,
  handleToggleInputHelper,
  dropDownStatus,
  handleDropDownStatus,
}: {
  name: string,
  value: string;
  type: string;
  resolvedTokens: ResolveTokenValuesResult[];
  handleChange: React.ChangeEventHandler;
  setInputValue: (newInputValue: string, property: string) => void;
  handleToggleInputHelper?: () => void;
  dropDownStatus?: string;
  handleDropDownStatus?: (name: string) => void;
}) {
  const onChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => handleChange(e), [handleChange]);
  const handleBoxshadowDownShiftInputChange = React.useCallback((newInputValue: string) => setInputValue(newInputValue, name), [name, setInputValue]);
  return (
    <DownshiftInput
      name={name}
      value={value}
      type={type}
      label={name}
      inlineLabel
      resolvedTokens={resolvedTokens}
      handleChange={onChange}
      setInputValue={handleBoxshadowDownShiftInputChange}
      placeholder={
        name === 'color' ? '#000000, hsla(), rgba() or {alias}' : 'Value or {alias}'
      }
      prefix={
        name === 'color' && value && (
          <StyledButton
            type="button"
            style={{ background: value, fontSize: 0 }}
            onClick={handleToggleInputHelper}
          >
            {value}
          </StyledButton>
        )
      }
      suffix
      handleDropDownStatus={handleDropDownStatus}
      dropDownStatus={dropDownStatus}
    />
  );
}

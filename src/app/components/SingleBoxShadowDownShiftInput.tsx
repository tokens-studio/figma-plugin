import React from 'react';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import DownshiftInput from './DownshiftInput';
import { styled } from '@/stitches.config';

const StyledButton = styled('button', {
  display: 'block',
  width: '1.5rem',
  height: '1.5rem',
  borderRadius: '$default',
  border: '1px solid',
  borderColor: '$border',
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
  onSubmit,
}: {
  name: string,
  value: string;
  type: string;
  resolvedTokens: ResolveTokenValuesResult[];
  handleChange: (property: string, value: string) => void;
  setInputValue: (newInputValue: string, property: string) => void;
  handleToggleInputHelper?: () => void;
  onSubmit: () => void
}) {
  const handleBoxshadowDownShiftInputChange = React.useCallback((newInputValue: string) => setInputValue(newInputValue, name), [name, setInputValue]);
  return (
    <DownshiftInput
      name={name}
      value={value}
      type={type}
      label={name}
      inlineLabel
      resolvedTokens={resolvedTokens}
      handleChange={handleChange}
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
      onSubmit={onSubmit}
    />
  );
}

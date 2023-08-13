import React from 'react';
import { useTranslation } from 'react-i18next';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import DownshiftInput from './DownshiftInput';
import { getLabelForProperty } from '@/utils/getLabelForProperty';
import { styled } from '@/stitches.config';

const StyledButton = styled('button', {
  display: 'block',
  width: '1.5rem',
  height: '1.5rem',
  borderRadius: '$small',
  cursor: 'pointer',
});

export default function BorderTokenDownShiftInput({
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
  const handleBorderDownShiftInputChange = React.useCallback((newInputValue: string) => setInputValue(newInputValue, name), [name, setInputValue]);
  const getIconComponent = React.useMemo(() => getLabelForProperty(name), [name]);

  const { t } = useTranslation(['tokens']);
  const mapTypeToPlaceHolder = {
    color: t('forms.border.color'),
    width: t('forms.border.width'),
    style: 'solid | dashed',
  };

  return (
    <DownshiftInput
      name={name}
      value={value}
      type={type}
      label={getIconComponent}
      inlineLabel
      resolvedTokens={resolvedTokens}
      handleChange={handleChange}
      setInputValue={handleBorderDownShiftInputChange}
      placeholder={mapTypeToPlaceHolder[name as keyof typeof mapTypeToPlaceHolder] as unknown as string}
      prefix={
        name === 'color' && (
          <StyledButton
            type="button"
            style={{ background: value ?? '#000000', fontSize: 0 }}
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

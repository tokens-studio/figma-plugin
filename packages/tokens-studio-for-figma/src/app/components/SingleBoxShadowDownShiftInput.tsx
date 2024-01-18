import React from 'react';
import { useTranslation } from 'react-i18next';
import { ResolveTokenValuesResult } from '@/utils/tokenHelpers';
import DownshiftInput from './DownshiftInput';
import { ColorPickerTrigger } from './ColorPickerTrigger';

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
  const { t } = useTranslation(['tokens']);
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
      placeholder={name === 'color' ? t('colorOrAlias') : t('valueOrAlias')}
      prefix={
        name === 'color' && value && (
          <ColorPickerTrigger
            background={value}
            onClick={handleToggleInputHelper}
          >
            {value}
          </ColorPickerTrigger>
        )
      }
      suffix
      onSubmit={onSubmit}
    />
  );
}

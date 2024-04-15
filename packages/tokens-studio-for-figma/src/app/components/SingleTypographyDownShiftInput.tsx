import React from 'react';
import { useTranslation } from 'react-i18next';
import { ResolveTokenValuesResult } from '@/utils/tokenHelpers';
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
  console.log('name: ', name);
  console.log('value: ', value);
  console.log('type: ', type);
  console.log('externalFontFamily: ', externalFontFamily);
  console.log('resolvedTokens: ', resolvedTokens);
  const handleBoxshadowDownShiftInputChange = React.useCallback((newInputValue: string) => {
    console.log('newInputValue: ', newInputValue);
    setInputValue(newInputValue, name);
  }, [name, setInputValue]);

  const getIconComponent = React.useMemo(() => getLabelForProperty(name), [name]);

  const { t } = useTranslation(['tokens']);

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
      placeholder={`${name} ${t('valueOrAlias')}`}
      suffix
      onSubmit={onSubmit}
    />
  );
}

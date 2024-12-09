import React from 'react';
import { useTranslation } from 'react-i18next';
import { ResolveTokenValuesResult } from '@/utils/tokenHelpers';
import DownshiftInput from './DownshiftInput';
import { getLabelForProperty } from '@/utils/getLabelForProperty';
import { getAliasValue } from '@/utils/alias';
import { ColorPickerTrigger } from './ColorPickerTrigger';

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
  name: string;
  value: string;
  type: string;
  resolvedTokens: ResolveTokenValuesResult[];
  handleChange: (property: string, value: string) => void;
  setInputValue: (newInputValue: string, property: string) => void;
  handleToggleInputHelper?: () => void;
  onSubmit: () => void;
}) {
  const [resolvedColor, setResolvedColor] = React.useState<string>(value ? String(value) : '');

  React.useEffect(() => {
    if (name === 'color' && value && value.startsWith('{')) {
      const aliasValue = getAliasValue(value, resolvedTokens);
      setResolvedColor(aliasValue ? String(aliasValue) : '');
    } else {
      setResolvedColor(typeof value === 'string' ? value : '');
    }
  }, [value, resolvedTokens, name]);

  const handleBorderDownShiftInputChange = React.useCallback(
    (newInputValue: string) => setInputValue(newInputValue, name),
    [name, setInputValue],
  );
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
          <ColorPickerTrigger onClick={handleToggleInputHelper} background={resolvedColor} />
        )
      }
      suffix
      onSubmit={onSubmit}
    />
  );
}

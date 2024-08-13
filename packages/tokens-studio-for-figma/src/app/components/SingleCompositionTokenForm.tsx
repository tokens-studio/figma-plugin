import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIDSeed } from 'react-uid';
import {
  Select, Box, IconButton, Stack,
} from '@tokens-studio/ui';
import IconMinus from '@/icons/minus.svg';
import { Properties } from '@/constants/Properties';
import { CompositionTokenProperty } from '@/types/CompositionTokenProperty';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import DownshiftInput from './DownshiftInput';
import { ResolveTokenValuesResult } from '@/utils/tokenHelpers';
import { useTypeForProperty } from '../hooks/useTypeForProperty';

export default function SingleCompositionTokenForm({
  index,
  property,
  propertyValue,
  tokenValue,
  properties,
  resolvedTokens,
  setTokenValue,
  onRemove,
  setOrderObj,
  setError,
  onSubmit,
}: {
  index: number;
  property: string;
  propertyValue: string;
  tokenValue: NodeTokenRefMap;
  properties: string[];
  resolvedTokens: ResolveTokenValuesResult[];
  setTokenValue: (neweTokenValue: NodeTokenRefMap) => void;
  onRemove: (property: string) => void;
  setOrderObj: (newOrderObj: NodeTokenRefMap) => void;
  setError: (newError: boolean) => void;
  onSubmit: () => void
}) {
  const propertyType = useTypeForProperty(property);
  const seed = useUIDSeed();
  const { t } = useTranslation(['tokens']);

  const onPropertySelected = useCallback((newProperty: string) => {
    // keep the order of the properties when select new property
    const newOrderObj: NodeTokenRefMap = {};
    const keysInTokenValue = Object.keys(tokenValue);
    keysInTokenValue.splice(index, 1, newProperty);
    keysInTokenValue.forEach((key, idx) => {
      newOrderObj[key as keyof typeof Properties] = String(idx);
    });
    setOrderObj(newOrderObj);

    // set newTokenValue
    delete tokenValue[property as keyof typeof Properties];
    tokenValue[newProperty as keyof typeof Properties] = propertyValue;
    setTokenValue(tokenValue);
    setError(false);
  }, [index, property, propertyValue, setError, setOrderObj, setTokenValue, tokenValue]);

  const onPropertyValueChanged = React.useCallback(
    (type: string, value: string) => {
      tokenValue[property as CompositionTokenProperty] = value;
      setTokenValue(tokenValue);
    },
    [property, setTokenValue, tokenValue],
  );

  const handleDownShiftInputChange = React.useCallback((newInputValue: string) => {
    tokenValue[property as CompositionTokenProperty] = newInputValue;
    setTokenValue(tokenValue);
  }, [property, setTokenValue, tokenValue]);

  const handleRemove = useCallback(() => {
    onRemove(property);
  }, [onRemove, property]);

  const renderSelect = () => (
    <Select value={property || t('chooseAProperty')} onValueChange={onPropertySelected}>
      <Select.Trigger
        value={property || t('chooseAProperty')}
        size="small"
        css={{
          borderTopRightRadius: '0',
          borderBottomRightRadius: '0',
          height: 'auto',
          alignSelf: 'stretch',
          width: '155px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          border: 'none', // We're using a wrapper that controls the border
          '& * svg': property ? { // Hides the arrow for properties
            display: 'none',
          } : {},
        }}
        data-testid="composition-token-dropdown"
      />
      <Select.Content>
        {properties.length > 0
              && properties.map((prop, idx) => <Select.Item data-testid={`item-dropdown-menu-element-${prop}`} key={`property-${seed(idx)}`} value={prop}>{prop}</Select.Item>)}
      </Select.Content>
    </Select>
  );

  return (
    <Box css={{
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '$3',
      '& > .relative ': {
        flex: '2',
      },
    }}
    >
      <Stack direction="row" css={{ flex: 1, alignItems: 'center' }}>
        <Box css={{ flexGrow: 1 }}>
          <DownshiftInput
            value={propertyValue}
            type={propertyType}
            resolvedTokens={resolvedTokens}
            handleChange={onPropertyValueChanged}
            setInputValue={handleDownShiftInputChange}
            prefix={renderSelect()}
            isComposition
            placeholder={
              propertyType === 'color' ? t('colorOrAlias') : t('valueOrAlias')
            }
            suffix
            onSubmit={onSubmit}
          />
        </Box>
      </Stack>
      <Box css={{ width: '$5', marginRight: '$4' }}>
        <IconButton
          tooltip={t('removeThisStyle')}
          data-testid="button-style-remove-multiple"
          onClick={handleRemove}
          icon={<IconMinus />}
          size="small"
          variant="invisible"
        />
      </Box>
    </Box>
  );
}

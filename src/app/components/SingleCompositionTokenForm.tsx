import React, { useCallback, useState } from 'react';
import { useUIDSeed } from 'react-uid';
import IconMinus from '@/icons/minus.svg';
import IconButton from './IconButton';
import Box from './Box';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
} from './DropdownMenu';
import { PropertyDropdownMenuRadioElement } from './PropertyDropdownMenuRadioElement';
import { Properties } from '@/constants/Properties';
import { CompositionTokenProperty } from '@/types/CompositionTokenProperty';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import DownshiftInput from './DownshiftInput';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
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
}) {
  const [menuOpened, setMenuOpened] = useState(false);
  const propertyType = useTypeForProperty(property);
  const [inputHelperOpen, setInputHelperOpen] = React.useState(false);
  const seed = useUIDSeed();

  const onPropertySelected = useCallback((newProperty: string) => {
    // keep the order of the properties when select new property
    const newOrderObj: NodeTokenRefMap = {};
    const keysInTokenValue = Object.keys(tokenValue);
    keysInTokenValue.splice(index, 1, newProperty);
    keysInTokenValue.forEach((key, index) => {
      newOrderObj[key as keyof typeof Properties] = String(index);
    });
    setOrderObj(newOrderObj);

    // set newTokenValue
    delete tokenValue[property as keyof typeof Properties];
    tokenValue[newProperty as keyof typeof Properties] = propertyValue;
    setTokenValue(tokenValue);
    setError(false);
  }, [tokenValue]);

  const onPropertyValueChanged = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      tokenValue[property as CompositionTokenProperty] = e.target.value;
      setTokenValue(tokenValue);
    },
    [tokenValue],
  );

  const handleDownShiftInputChange = React.useCallback((newInputValue: string) => {
    tokenValue[property as CompositionTokenProperty] = newInputValue;
    setTokenValue(tokenValue);
  }, [tokenValue]);

  // const onPropertyValueChanged = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  //   tokenValue[property as CompositionTokenProperty] = e.target.value;
  //   setTokenValue(tokenValue);
  // }, [tokenValue]);

  const handleToggleMenu = useCallback(() => {
    setMenuOpened(!menuOpened);
  }, [menuOpened]);

  const handleRemove = useCallback(() => {
    onRemove(property);
  }, [onRemove, property]);

  const handleToggleInputHelper = React.useCallback(() => {
    setInputHelperOpen(!inputHelperOpen);
  }, [inputHelperOpen]);

  return (
    <Box>
      <Box css={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '$3',
        '& > label': {
          flex: 4,
          fontSize: '$5 !important',
          '& > div > input': {
            height: '$10',
          },
        },
      }}
      >
        <DropdownMenu open={menuOpened} onOpenChange={handleToggleMenu}>
          <DropdownMenuTrigger bordered css={{ flex: 3, minHeight: '$10' }}>
            <span>{property || 'Choose a property'}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={2} className="content scroll-container" css={{ maxHeight: '$dropdownMaxHeight' }}>
            {' '}
            <DropdownMenuRadioGroup value={property}>
              {properties.length > 0
                && properties.map((property, index) => <PropertyDropdownMenuRadioElement key={`property-${seed(index)}`} property={property} index={index} propertySelected={onPropertySelected} />)}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DownshiftInput
          value={propertyValue}
          type={propertyType === 'fill' ? 'color' : propertyType}
          resolvedTokens={resolvedTokens}
          handleChange={onPropertyValueChanged}
          setInputValue={handleDownShiftInputChange}
          prefix={
            propertyType === 'color' && (
              <button
                type="button"
                className="block w-4 h-4 rounded-sm cursor-pointer shadow-border shadow-gray-300 focus:shadow-focus focus:shadow-primary-400"
                style={{ background: propertyValue, fontSize: 0 }}
                onClick={handleToggleInputHelper}
              >
                {propertyValue}
              </button>
            )
          }
          placeholder={
            propertyType === 'color' ? '#000000, hsla(), rgba() or {alias}' : 'Value or {alias}'
          }
          suffix
        />

        <Box css={{ width: '$5', marginRight: '$3' }}>
          <IconButton
            tooltip="Remove this style"
            dataCy="button-style-remove-multiple"
            onClick={handleRemove}
            icon={<IconMinus />}
          />
        </Box>
      </Box>
    </Box>
  );
}

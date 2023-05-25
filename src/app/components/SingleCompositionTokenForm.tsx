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
import { DropdownMenuRadioElement } from './DropdownMenuRadioElement';
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
  const [menuOpened, setMenuOpened] = useState(false);
  const propertyType = useTypeForProperty(property);
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

  const onPropertyValueChanged = React.useCallback(
    (type: string, value: string) => {
      tokenValue[property as CompositionTokenProperty] = value;
      setTokenValue(tokenValue);
    },
    [tokenValue],
  );

  const handleDownShiftInputChange = React.useCallback((newInputValue: string) => {
    tokenValue[property as CompositionTokenProperty] = newInputValue;
    setTokenValue(tokenValue);
  }, [tokenValue]);

  const handleToggleMenu = useCallback(() => {
    setMenuOpened(!menuOpened);
  }, [menuOpened]);

  const handleRemove = useCallback(() => {
    onRemove(property);
  }, [onRemove, property]);

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
      <DropdownMenu open={menuOpened} onOpenChange={handleToggleMenu}>
        <DropdownMenuTrigger
          data-cy="composition-token-dropdown"
          bordered
          css={{
            width: '130px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', height: '$10',
          }}
        >
          {property || 'Choose a property'}
        </DropdownMenuTrigger>
        <DropdownMenuContent sideOffset={2} className="content scroll-container" css={{ maxHeight: '$dropdownMaxHeight' }}>
          {' '}
          <DropdownMenuRadioGroup value={property}>
            {properties.length > 0
                && properties.map((property, index) => <DropdownMenuRadioElement key={`property-${seed(index)}`} item={property} index={index} itemSelected={onPropertySelected} />)}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Box css={{ flexGrow: 1 }}>
        <DownshiftInput
          value={propertyValue}
          type={propertyType}
          resolvedTokens={resolvedTokens}
          handleChange={onPropertyValueChanged}
          setInputValue={handleDownShiftInputChange}
          placeholder={
            propertyType === 'color' ? '#000000, hsla(), rgba() or {alias}' : 'Value or {alias}'
          }
          suffix
          onSubmit={onSubmit}
        />
      </Box>
      <Box css={{ width: '$5', marginRight: '$3' }}>
        <IconButton
          tooltip="Remove this style"
          dataCy="button-style-remove-multiple"
          onClick={handleRemove}
          icon={<IconMinus />}
        />
      </Box>
    </Box>
  );
}

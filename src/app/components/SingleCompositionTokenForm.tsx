import React, { useCallback, useState } from 'react';
import { useUIDSeed } from 'react-uid';
import IconMinus from '@/icons/minus.svg';
import IconButton from './IconButton';
import Box from './Box';
import Input from './Input';
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

export default function SingleCompositionTokenForm({
  index,
  property,
  value,
  tokenValue,
  properties,
  setTokenValue,
  onRemove,
  setOrderObj,
  setError,
}: {
  index: number;
  property: string;
  value: string;
  tokenValue: NodeTokenRefMap;
  properties: string[];
  setTokenValue: (neweTokenValue: NodeTokenRefMap) => void;
  onRemove: (property: string) => void;
  setOrderObj: (newOrderObj: NodeTokenRefMap) => void;
  setError: (newError: boolean) => void;
}) {
  const [menuOpened, setMenuOpened] = useState(false);
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
    tokenValue[newProperty as keyof typeof Properties] = value;
    setTokenValue(tokenValue);
    setError(false);
  }, [tokenValue]);

  const onAliasChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    tokenValue[property as CompositionTokenProperty] = e.target.value.trim();
    setTokenValue(tokenValue);
  }, [tokenValue]);

  const handleToggleMenu = useCallback(() => {
    setMenuOpened(!menuOpened);
  }, [menuOpened]);

  const handleRemove = useCallback(() => {
    onRemove(property);
  }, [onRemove, property]);

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

        <Input
          required
          full
          value={value}
          onChange={onAliasChange}
          type="text"
          name="alias"
          placeholder="Alias"
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

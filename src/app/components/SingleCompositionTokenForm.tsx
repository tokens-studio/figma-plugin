import React, { useCallback, useState } from 'react';
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
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { Properties } from '@/constants/Properties';
import { compositionTokenProperty } from '@/types/CompositionTokenProperty';

export default function SingleCompositionTokenForm({
  index,
  property,
  value,
  tokenValue,
  properties,
  setTokenValue,
  onRemove,
  handleOrderObj
}: {
  index: number;
  property: string;
  value: string;
  tokenValue: NodeTokenRefMap;
  properties: string[],
  setTokenValue: (neweTokenValue: NodeTokenRefMap) => void;
  onRemove: (property: string) => void;
  handleOrderObj: (newOrderObj: object) => void;
}) {
  const [menuOpened, setMenuOpened] = useState(false);
  const onPropertySelected = useCallback((newProperty: string) => {
    // keep the order of the properties when select new property
    const newOrderObj: NodeTokenRefMap = {};
    let keysInTokenValue = Object.keys(tokenValue);
    keysInTokenValue.splice(index, 1, newProperty);
    keysInTokenValue.map((key, index) => {
      newOrderObj[key as keyof typeof Properties] = String(index)
    });
    handleOrderObj(newOrderObj);

    // set newTokenValue
    delete tokenValue[property as keyof typeof Properties];
    tokenValue[newProperty as keyof typeof Properties] = value;
    setTokenValue(tokenValue);
  }, [tokenValue]);

  const onAliasChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    tokenValue[property as compositionTokenProperty] = e.target.value;
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
          flex: 3,
          fontSize: '$5 !important',
          '& > div > input': {
            height: '$10',
          },
        },
      }}
      >
        <DropdownMenu open={menuOpened} onOpenChange={handleToggleMenu}>
          <DropdownMenuTrigger css={{ flex: 4, minHeight: '$10',   border: '1px solid $borderMuted' }}>
            <span>{property}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={2} className='content scroll-container' css={{ maxHeight: '$11', backgroundColor: '$bgDefault', color: '$text'}}>
            <DropdownMenuRadioGroup value={property}>
              {properties.length > 0
                && properties.map((property, index) => <PropertyDropdownMenuRadioElement property={property} index={index} propertySelected={onPropertySelected} />)}
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

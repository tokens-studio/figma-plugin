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

export default function SingleCompositionTokenForm({
  index,
  property,
  value,
  tokenValue,
  properties,
  orderObj,
  setValue,
  onRemove,
  handleOrderObj
}: {
  index: number;
  property: string;
  value: string;
  tokenValue: NodeTokenRefMap
  properties: string[],
  orderObj: NodeTokenRefMap;
  setValue: (neweTokenValue: NodeTokenRefMap) => void;
  onRemove: (property: string) => void;
  handleOrderObj: (newOrderObj: object) => void;
}) {
  const [menuOpened, setMenuOpened] = useState(false);
  const onPropertySelected = useCallback((newProperty: string) => {
    // if (Array.isArray(tokens)) {
    //   let values = tokens;
    //   const newToken = { ...tokens[index], property };
    //   values.splice(index, 1, newToken);
    //   setValue(values);
    // } else {
    //   setValue({ ...tokens, property });
    // }
    // setMenuOpened(false);
    let newTokenValue = tokenValue;
    let keysInTokenValue = Object.keys(newTokenValue);
    keysInTokenValue.splice(index, 1, newProperty);
    console.log("keysinTokenvalue", keysInTokenValue);
    let newOrderObj: Object = {};
    keysInTokenValue.map((key, index) => {
      Object.defineProperty(newOrderObj, key, {
        value: index
      })
    });
    console.log("neweorderobj", newOrderObj)
    handleOrderObj(newOrderObj);
    delete newTokenValue[property as keyof typeof Properties];
    Object.defineProperty(newTokenValue, newProperty, {
      value: ''
    });
    console.log("firstnewTokenvalue", newTokenValue)
    setValue(newTokenValue);
  }, [tokenValue]);

  const onAliasChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // if (Array.isArray(tokens)) {
    //   let values = tokens;
    //   const newToken = { ...tokens[index], value: e.target.value };
    //   values.splice(index, 1, newToken);
    //   setValue(values);
    // } else {
    //   setValue({ ...tokens, value: e.target.value });
    // }
      let newTokenValue = tokenValue;
      newTokenValue[property as keyof typeof Properties] = e.target.value;
      console.log("aliaschange", newTokenValue)
      setValue(newTokenValue);
  }, [tokenValue]);

  const handleToggleMenu = useCallback(() => {
    setMenuOpened(!menuOpened);
  }, [menuOpened]);

  const handleRemove = useCallback(() => {
    console.log("remove", property)
    onRemove(property);
  }, [onRemove, property]);

  React.useEffect(() => {
    console.log("value", value, "property", property, "tokenvalue", tokenValue)
  }, [property, value, tokenValue])
  return (
    <Box>
      <Box css={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '$3',
        '& > label': {
          flex: 1,
          fontSize: '$5 !important',
          '& > div > input': {
            flex: 2,
            marginRight: '$5',
            height: '$10',
          },
        },
      }}
      >
        <DropdownMenu open={menuOpened} onOpenChange={handleToggleMenu}>
          <DropdownMenuTrigger css={{flex: 2, minHeight: '38px', border: '1px solid black'}}>
            <span>{property}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={2} className='content scroll-container' css={{maxHeight: '140px'}}>
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

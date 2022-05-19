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
  setValue,
  onRemove,
}: {
  index: number;
  property: string;
  value: string;
  tokenValue: NodeTokenRefMap | null
  properties: string[],
  setValue: (neweTokenValue: NodeTokenRefMap) => void;
  onRemove: (property: string) => void;
}) {
  const [menuOpened, setMenuOpened] = useState(false);
  const onPropertySelected = useCallback((property: string) => {
    // if (Array.isArray(tokens)) {
    //   let values = tokens;
    //   const newToken = { ...tokens[index], property };
    //   values.splice(index, 1, newToken);
    //   setValue(values);
    // } else {
    //   setValue({ ...tokens, property });
    // }
    // setMenuOpened(false);
    const values = tokens;
    const newToken = { ...tokens[index], property };
    values.splice(index, 1, newToken);
    setValue(values);
    setMenuOpened(false);
  }, [tokens]);

  const onAliasChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // if (Array.isArray(tokens)) {
    //   let values = tokens;
    //   const newToken = { ...tokens[index], value: e.target.value };
    //   values.splice(index, 1, newToken);
    //   setValue(values);
    // } else {
    //   setValue({ ...tokens, value: e.target.value });
    // }
    if (property.length > 0) {
      let newTokenValue = tokenValue;
      newTokenValue[property as keyof typeof Properties] = e.target.value;
      setValue(newTokenValue);  
    }
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
            <span>{token.property}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={2} className='content scroll-container' css={{maxHeight: '140px'}}>
            <DropdownMenuRadioGroup value={token.property}>
              {properties.length > 0
                && properties.map((property, index) => <PropertyDropdownMenuRadioElement property={property} index={index} propertySelected={onPropertySelected} />)}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Input
          required
          full
          value={token.value}
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

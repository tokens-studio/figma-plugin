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

type CompositionTokenToArrayItem = {
  property: string,
  value: string
};

export default function SingleCompositionTokenForm({
  index,
  token,
  tokens,
  properties,
  setValue,
  onRemove,
}: {
  index: number;
  token: CompositionTokenToArrayItem;
  tokens: CompositionTokenToArrayItem[];
  properties: string[],
  setValue: (token: CompositionTokenToArrayItem[]) => void;
  onRemove: (index: number) => void;
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

  React.useEffect(() => {
    console.log("tokens", tokens, properties)
  }, [])

  const onAliasChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // if (Array.isArray(tokens)) {
    //   let values = tokens;
    //   const newToken = { ...tokens[index], value: e.target.value };
    //   values.splice(index, 1, newToken);
    //   setValue(values);
    // } else {
    //   setValue({ ...tokens, value: e.target.value });
    // }
    const values = tokens;
    const newToken = { ...tokens[index], value: e.target.value };
    values.splice(index, 1, newToken);
    setValue(values);
  }, [tokens]);

  const handleToggleMenu = useCallback(() => {
    setMenuOpened(!menuOpened);
  }, [menuOpened]);

  const handleRemove = useCallback(() => {
    onRemove(index);
  }, [onRemove, index]);

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

import React, { useCallback, useState } from 'react';
import { TokenCompositionValue } from '@/types/values';
import IconMinus from '@/icons/minus.svg';
import IconButton from './IconButton';
import Box from './Box';
import Input from './Input';
import {
  PropertySwitchMenu,
  PropertySwitchMenuContent,
  PropertySwitchMenuMainTrigger,
  PropertySwitchMenuRadioGroup,
} from './PropertySwitchMenu';
import { PropertySwitchMenuRadioElement } from './PropertySwitchMenuRadioElement';

export default function SingleCompositionTokenForm({
  index,
  token,
  tokens,
  properties,
  setValue,
  onRemove,
}: {
  index: number;
  token?: TokenCompositionValue;
  tokens?: TokenCompositionValue | TokenCompositionValue[];
  properties: string[],
  setValue: (property: TokenCompositionValue | TokenCompositionValue[]) => void;
  onRemove: (index: number) => void;
}) {
  const [menuOpened, setMenuOpened] = useState(false);
  const onPropertySelected = useCallback((property: string) => {
    if (Array.isArray(tokens)) {
      const values = tokens;
      const newToken = { ...tokens[index], property };
      values.splice(index, 1, newToken);
      setValue(values);
    } else if (tokens) {
      setValue({ ...tokens, property });
    }
    setMenuOpened(false);
  }, [index, tokens, setValue]);

  const onAliasChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (Array.isArray(tokens)) {
      const values = tokens;
      const newToken = { ...tokens[index], value: e.target.value };
      values.splice(index, 1, newToken);
      setValue(values);
    } else if (tokens) {
      setValue({ ...tokens, value: e.target.value });
    }
  }, [index, tokens, setValue]);

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
        '& > label': {
          flex: 2,
          fontSize: '$5 !important',
          '& > div > input': {
            flex: 2,
            marginRight: '$5',
            height: '$10',
          },
        },
      }}
      >
        <PropertySwitchMenu open={menuOpened} onOpenChange={handleToggleMenu}>
          <PropertySwitchMenuMainTrigger>
            <span>{token?.property}</span>
          </PropertySwitchMenuMainTrigger>
          <PropertySwitchMenuContent sideOffset={2}>
            <PropertySwitchMenuRadioGroup value={token?.property}>
              {properties.length > 0
              && properties.map((property, index) => <PropertySwitchMenuRadioElement property={property} index={index} propertySelected={onPropertySelected} />)}
            </PropertySwitchMenuRadioGroup>
          </PropertySwitchMenuContent>
        </PropertySwitchMenu>

        <Input
          required
          full
          value={token?.value}
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

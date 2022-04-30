import React, { useCallback, useState } from 'react';
import { CompositionTokenSingleValue } from '@/types/propertyTypes';
import IconMinus from '@/icons/minus.svg';
import IconPlus from '@/icons/plus.svg';
import Heading from './Heading';
import IconButton from './IconButton';
import Box from './Box';
import Input from './Input';
import {
  PropertySwitchMenu,
  PropertySwitchMenuContent,
  PropertySwitchMenuMainTrigger,
  PropertySwitchMenuRadioGroup,
  PropertySwitchMenuRadioItem
} from './PropertySwitchMenu';
import { Properties } from '@/constants/Properties';
import { EditTokenObject } from '../store/models/uiState';

function SingleStyleInput({
  index,
  token,
  tokens,
  properties,
  setValue,
  onRemove,
}: {
  index: number;
  token: CompositionTokenSingleValue;
  tokens: CompositionTokenSingleValue | CompositionTokenSingleValue[];
  properties: string[],
  setValue: (property: CompositionTokenSingleValue | CompositionTokenSingleValue[]) => void;
  onRemove: (index: number) => void;
}) {

  const [menuOpened, setMenuOpened] = useState(false);
  const onPropertySelected = useCallback((property: string) => {
    if (Array.isArray(tokens)) {
      let values = tokens;
      const newToken = { ...tokens[index], property: property };
      values.splice(index, 1, newToken);
      setValue(values);
    } else {
      setValue({ ...tokens, property: property });
    }
    setMenuOpened(false);
  }, [tokens]);


  const onAliasChange = (e) => {
    if (Array.isArray(tokens)) {
      let values = tokens;
      const newToken = { ...tokens[index], value: e.target.value };
      values.splice(index, 1, newToken);
      setValue(values);
    } else {
      setValue({ ...tokens, value: e.target.value });
    }
  };

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
            height: '$10'
          }
        }
      }}
      >
        <PropertySwitchMenu open={menuOpened} onOpenChange={() => setMenuOpened(!menuOpened)}>
          <PropertySwitchMenuMainTrigger>
            <span>{token.property}</span>
          </PropertySwitchMenuMainTrigger>
          <PropertySwitchMenuContent side="top" sideOffset={2}>
            <PropertySwitchMenuRadioGroup value={token.property}>
              {properties.length > 0
                && properties.map((property, index) => (
                  <PropertySwitchMenuRadioItem value={property} key={index} onSelect={() => onPropertySelected(property)}>
                    {` ${property}`}
                  </PropertySwitchMenuRadioItem>
                  )
                )}
            </PropertySwitchMenuRadioGroup>
          </PropertySwitchMenuContent>
        </PropertySwitchMenu>

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
            onClick={() => onRemove(index)}
            icon={<IconMinus />}
          />
        </Box>
      </Box>
    </Box>
  );
}

const newToken: CompositionTokenSingleValue = {
  property: '', value: '',
};

export default function CompositionTokenForm({
  internalEditToken,
  setValue,
}: {
  internalEditToken: EditTokenObject;
  setValue: (style: CompositionTokenSingleValue | CompositionTokenSingleValue[]) => void;
}) {

  const propertiesMenu = React.useMemo(() => {
    return Object.keys(Properties).map((key) => {
      return Properties[key];
    });
  }, [Properties]);

  const addToken = () => {
    if (Array.isArray(internalEditToken.value)) {
      setValue([...internalEditToken.value, newToken]);
    } else {
      setValue([internalEditToken.value, newToken]);
    }
  };

  const removeToken = (index) => {
    if (Array.isArray(internalEditToken.value)) {
      setValue(internalEditToken.value.filter((_, i) => i !== index));
    }
  };

  return (
    <div>
      <Box css={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Heading size="small">Tokens</Heading>
        <IconButton
          tooltip="Add another style"
          dataCy="button-style-add-multiple"
          onClick={addToken}
          icon={<IconPlus />}
        />
      </Box>
      <Box css={{ display: 'flex', flexDirection: 'column', gap: '$4' }}>
        {Array.isArray(internalEditToken.value) ? (
          internalEditToken.value.map((token, index) => (
            <SingleStyleInput
              index={index}
              token={token}
              tokens={internalEditToken.value}
              key={`single-style-${index}`}
              properties={propertiesMenu}
              setValue={setValue}
              onRemove={removeToken}
            />
          ))
        ) : (
          <SingleStyleInput
            tokens={internalEditToken.value}
            token={internalEditToken.value}
            index={0}
            properties={propertiesMenu}
            setValue={setValue}
          />
        )}
      </Box>
    </div>
  );
}

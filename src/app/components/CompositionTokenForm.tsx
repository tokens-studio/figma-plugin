import React, { useEffect } from 'react';
import { CompositionTokenSingleValue } from '@/types/propertyTypes';
import IconMinus from '@/icons/minus.svg';
import IconPlus from '@/icons/plus.svg';
import Heading from './Heading';
import IconButton from './IconButton';
import Box from './Box';
import Input from './Input';
import SelectableInput from './SelectableInput';
import { Properties } from '@/constants/Properties';

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
  properties: object[],
  setValue: (property: CompositionTokenSingleValue | CompositionTokenSingleValue[]) => void;
  onRemove: (index: number) => void;
}) {

  const defaultProperty = {
    value: token.property,
    label: token.property,
  };

  const onPropertyChange = (e) => {
    if (Array.isArray(tokens)) {
      const values = tokens;
      const newToken = { ...tokens[index], property: e.value };
      values.splice(index, 1, newToken);
      setValue(values);
    } else {
      setValue({ ...tokens, property: e.value });
    }
  };

  const onAliasChange = (e) => {
    if (Array.isArray(tokens)) {
      const values = tokens;
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
        '& > div:nth-child(1)': {
          flex: 1,
          marginRight: '$5',
        },
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
        <SelectableInput
          name="property"
          data={properties}
          defaultData={defaultProperty}
          onChange={onPropertyChange}
          required
        />
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
const properties: object[] = [];

export default function CompositionTokenForm({
  value,
  setValue,
}: {
  value: CompositionTokenSingleValue | CompositionTokenSingleValue[];
  setValue: (style: CompositionTokenSingleValue | CompositionTokenSingleValue[]) => void;
}) {

  useEffect(() => {
    makePropertisMenu();
  }, []);

  const makePropertisMenu = () => {
    for (const property in Properties) {
      properties.push({
        value: property,
        label: property,
      });
    }
  };

  const addToken = () => {
    if (Array.isArray(value)) {
      setValue([...value, newToken]);
    } else {
      setValue([value, newToken]);
    }
  };

  const removeToken = (index) => {
    if (Array.isArray(value)) {
      setValue([...value.filter((_, i) => i !== index)]);
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
        {Array.isArray(value) ? (
          value.map((token, index) => (
            <SingleStyleInput
              index={index}
              token={token}
              tokens={value}
              key={`single-style-${index}`}
              properties={properties}
              setValue={setValue}
              onRemove={removeToken}
            />
          ))
        ) : (
          <SingleStyleInput
            tokens={value}
            token={value}
            index={0}
            properties={properties}
            setValue={setValue}
          />
        )}
      </Box>
    </div>
  );
}

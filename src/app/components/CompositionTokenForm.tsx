import React, { useEffect } from 'react';
import { CompositionTokenSingleValue } from '@/types/propertyTypes';
import IconMinus from '@/icons/minus.svg';
import IconPlus from '@/icons/plus.svg';
import Heading from './Heading';
import IconButton from './IconButton';
import Box from './Box';
import Input from './Input';
import SelectableInput from './SelectableInput';
import propertyOptions from '../../config/properties.js';

function SingleStyleInput({
  index,
  styleItem,
  tokens,
  properties,
  setValue,
  onRemove,
}: {
  index: number;
  styleItem: CompositionTokenSingleValue;
  tokens: CompositionTokenSingleValue | CompositionTokenSingleValue[];
  properties: object[],
  setValue: (property: CompositionTokenSingleValue | CompositionTokenSingleValue[]) => void;
  onRemove: (index: number) => void;
}) {

  const defaultProperty = {
    value: styleItem.property,
    label: styleItem.property,
  };

  const onPropertyChange = (e) => {
    if (Array.isArray(tokens)) {
      const values = tokens;
      const newStyle = { ...tokens[index], property: e.value };
      values.splice(index, 1, newStyle);
      setValue(values);
    } else {
      setValue({ ...tokens, property: e.value });
    }
  };

  const onAliasChange = (e) => {
    if (Array.isArray(tokens)) {
      const values = tokens;
      const newStyle = { ...tokens[index], value: e.target.value };
      values.splice(index, 1, newStyle);
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
        '& > label:nth-child(2)': {
          flex: 2,
          marginRight: '$5',
          fontSize: '$5',
          height: '$10'
        },
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
          value={styleItem.value}
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
    for (const property in propertyOptions) {
      properties.push({
        value: property,
        label: property,
      });
    }
  };

  const addStyle = () => {
    if (Array.isArray(value)) {
      setValue([...value, newToken]);
    } else {
      setValue([value, newToken]);
    }
  };

  const removeStyle = (index) => {
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
          onClick={addStyle}
          icon={<IconPlus />}
        />
      </Box>
      <Box css={{ display: 'flex', flexDirection: 'column', gap: '$4' }}>
        {Array.isArray(value) ? (
          value.map((style, index) => (
            <SingleStyleInput
              index={index}
              styleItem={style}
              tokens={value}
              key={`single-style-${index}`}
              properties={properties}
              setValue={setValue}
              onRemove={removeStyle}
            />
          ))
        ) : (
          <SingleStyleInput
            tokens={value}
            styleItem={value}
            index={0}
            properties={properties}
            setValue={setValue}
          />
        )}
      </Box>
    </div>
  );
}

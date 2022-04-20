import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { CompositionTokenSingleValue } from '@/types/propertyTypes';
import { getAliasValue } from '@/utils/alias';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import IconMinus from '@/icons/minus.svg';
import IconPlus from '@/icons/plus.svg';
import { tokensSelector } from '@/selectors';
import Heading from './Heading';
import IconButton from './IconButton';
import Box from './Box';
import SelectableInput from './SelectableInput';
import propertyOptions from '../../config/properties.js';

function SingleStyleInput({
  index,
  styleItem,
  tokens,
  resolvedTokens,
  tokenType,
  properties,
  tokenValues,
  setValue,
  onRemove,
}: {
  index: number;
  styleItem: CompositionTokenSingleValue;
  tokens: CompositionTokenSingleValue | CompositionTokenSingleValue[];
  resolvedTokens: ResolveTokenValuesResult[];
  tokenType: string;
  properties: object[],
  tokenValues: object[],
  setValue: (property: CompositionTokenSingleValue | CompositionTokenSingleValue[]) => void;
  onRemove: (index: number) => void;
}) {
  const resolvedValue = React.useMemo(() => {
    if (styleItem) {
      return typeof styleItem.value === 'object'
        ? null
        : getAliasValue(styleItem.value, resolvedTokens);
    }
    return null;
  }, [styleItem, resolvedTokens]);

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

  const onValueChange = (e) => {
    if (Array.isArray(tokens)) {
      const values = tokens;
      const newStyle = { ...tokens[index], value: e.value };
      values.splice(index, 1, newStyle);
      setValue(values);
    } else {
      setValue({ ...tokens, value: e.value });
    }
  };
  const defaultProperty = {
    value: styleItem.property,
    label: styleItem.property,
  };
  const defaultValue = {
    value: styleItem.value,
    label: styleItem.value,
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
        '& > div:nth-child(2)': {
          flex: 2,
          marginRight: '$5',
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
        <SelectableInput
          name="value"
          data={tokenValues}
          defaultData={defaultValue}
          onChange={onValueChange}
          required
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
const tokenValues: object[] = [];

export default function CompositionTokenForm({
  value,
  setValue,
  resolvedTokens,
  tokenType,
}: {
  value: CompositionTokenSingleValue | CompositionTokenSingleValue[];
  setValue: (style: CompositionTokenSingleValue | CompositionTokenSingleValue[]) => void;
  resolvedTokens: ResolveTokenValuesResult[];
  tokenType: string
}) {
  const tokens = useSelector(tokensSelector);

  useEffect(() => {
    makePropertisMenu();
    makeTokensMenu();
  }, []);

  const makePropertisMenu = () => {
    for (const property in propertyOptions) {
      const tempObject = {
        value: property,
        label: property,
      };
      properties.push(tempObject);
    }
  };

  const makeTokensMenu = () => {
    for (const key in tokens) {
      for (let index = 0; index < tokens[key].length; index++) {
        const tempObject = {
          value: tokens[key][index].name,
          label: tokens[key][index].name,
        };
        tokenValues.push(tempObject);
      }
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
              resolvedTokens={resolvedTokens}
              tokenType={tokenType}
              properties={properties}
              tokenValues={tokenValues}
              setValue={setValue}
              onRemove={removeStyle}
            />
          ))
        ) : (
          <SingleStyleInput
            tokens={value}
            styleItem={value}
            index={0}
            resolvedTokens={resolvedTokens}
            properties={properties}
            tokenValues={tokenValues}
            tokenType={tokenType}
            setValue={setValue}
          />
        )}
      </Box>
    </div>
  );
}

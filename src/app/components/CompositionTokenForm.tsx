import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { CompositionTokenSingleValue } from '@/types/propertyTypes';
import { checkIfContainsAlias, getAliasValue } from '@/utils/alias';
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
  resolvedTokens,
  tokenType,
  setValue,
  onRemove,
}: {
  index: number;
  styleItem: CompositionTokenSingleValue | CompositionTokenSingleValue[];
  resolvedTokens: ResolveTokenValuesResult[];
  tokenType: string;
  setValue: (property: CompositionTokenSingleValue | CompositionTokenSingleValue[]) => void;
  onRemove: (index: number) => void;
}) {
  const tokens = useSelector(tokensSelector);
  const properties: object[] = [];

  useEffect(() => {
    console.log('prope', propertyOptions);
    for (const property in propertyOptions) {
      const tempObject = {
        value: property,
        label: property,
      };
      properties.push(tempObject);
    }
    console.log('pro', properties);
  }, []);

  const resolvedValue = React.useMemo(() => {
    if (styleItem) {
      return typeof styleItem.value === 'object'
        ? null
        : getAliasValue(styleItem.value, resolvedTokens);
    }
    return null;
  }, [styleItem, resolvedTokens]);

  const onPropertyChange = (e) => {
    if (Array.isArray(styleItem)) {
      const values = styleItem;
      const newStyle = { ...styleItem[index], property: e.value };
      values.splice(index, 1, newStyle);

      setValue(values);
    } else {
      setValue({ ...styleItem, property: e.value });
    }
  };

  const onValueChange = (e) => {
    if (Array.isArray(styleItem)) {
      const values = styleItem;
      const newStyle = { ...styleItem[index], value: e.value };
      values.splice(index, 1, newStyle);

      setValue(values);
    } else {
      setValue({ ...styleItem, value: e.value });
    }
  };

  return (
    <Box>
      <Box css={{
        display: 'flex',
        justifyContent: 'space-between',
        '& > label:nth-child(1)': {
          flex: 1,
          marginRight: '$5',
        },
        '& > label:nth-child(2)': {
          flex: 2,
          marginRight: '$5',
        },
      }}
      >

        <SelectableInput
          name="property"
          data={properties}
          defaultData={styleItem.property}
          onChange={onPropertyChange}
          required
        />
        <SelectableInput
          name="value"
          defaultData={styleItem.value}
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
      {checkIfContainsAlias(styleItem.value) && (
        <div className="flex p-2 mt-2 font-mono text-gray-700 bg-gray-100 border-gray-300 rounded text-xxs itms-center">
          {tokenType === 'color' ? (
            <div
              className="w-4 h-4 mr-1 border border-gray-200 rounded"
              style={{ background: resolvedValue }}
            />
          ) : null}
          {resolvedValue}
        </div>
      )}
    </Box>
  );
}

const newToken: CompositionTokenSingleValue = {
  property: '', value: '',
};

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
  const addStyle = () => {
    if (Array.isArray(value)) {
      setValue([...value, newToken]);
    } else {
      setValue([value, newToken]);
    }
  };

  const removeStyle = (index) => {
    if (Array.isArray(value)) {
      setValue(value.filter((_, i) => i !== index));
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
              key={`single-style-${index}`}
              resolvedTokens={resolvedTokens}
              tokenType={tokenType}
              setValue={setValue}
              onRemove={(index) => removeStyle(index)}
            />
          ))
        ) : (
          <SingleStyleInput
            styleItem={value}
            resolvedTokens={resolvedTokens}
            tokenType={tokenType}
            setValue={setValue}
          />
        )}
      </Box>
    </div>
  );
}

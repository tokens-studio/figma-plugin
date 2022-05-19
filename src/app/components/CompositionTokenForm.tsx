import React, { useCallback } from 'react';
import IconPlus from '@/icons/plus.svg';
import { Properties } from '@/constants/Properties';
import { SingleCompositionToken } from '@/types/tokens';
import Heading from './Heading';
import IconButton from './IconButton';
import Box from './Box';
import SingleCompositionTokenForm from './SingleCompositionTokenForm';

type CompositionTokenToArrayItem = {
  property: string,
  value: string
};

const newToken: CompositionTokenToArrayItem = {
  property: '', value: '',
};

export default function CompositionTokenForm({
  internalEditToken,
  setValue,
}: {
  internalEditToken: SingleCompositionToken;
  setValue: (style: CompositionTokenToArrayItem | CompositionTokenToArrayItem[]) => void;
}) {
  const propertiesMenu = React.useMemo(() => (
    Object.keys(Properties).map((key: string) => (
      String(Properties[key as keyof typeof Properties])
    ))
  ), [Properties]);

  const compositionTokenToArray = React.useMemo(() => {
    console.log('inter', internalEditToken.value);
    if (internalEditToken.value === null) {
      return [newToken];
    }
    return Object.entries(internalEditToken.value).map(([key, value]) => (
      {
        property: key,
        value,
      }
    ));
  }, [internalEditToken.value]);

  const addToken = useCallback(() => {
    // if (Array.isArray(internalEditToken.value)) {
    //   setValue([...internalEditToken.value, newToken]);
    // } else {
    //   setValue([internalEditToken.value, newToken]);
    // }
    setValue([...compositionTokenToArray, newToken]);
  }, [compositionTokenToArray]);

  const removeToken = useCallback((index) => {
    if (compositionTokenToArray.length > 1) {
      setValue(compositionTokenToArray.filter((_, i) => i !== index));
    }
  }, [compositionTokenToArray]);

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
        {/* {Array.isArray(internalEditToken.value) ? (
          internalEditToken.value.map((token, index) => (
            <SingleCompositionTokenForm
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
          <SingleCompositionTokenForm
            index={-1}
            token={internalEditToken.value}
            tokens={internalEditToken.value}
            key={`single-style`}
            properties={propertiesMenu}
            setValue={setValue}
            onRemove={removeToken}
          />
        )} */}
        {
          compositionTokenToArray.map((token, index) => (
            <SingleCompositionTokenForm
              index={index}
              token={token}
              tokens={compositionTokenToArray}
              key={`single-style-${index}`}
              properties={propertiesMenu}
              setValue={setValue}
              onRemove={removeToken}
            />
          ))
        }
      </Box>
    </div>
  );
}

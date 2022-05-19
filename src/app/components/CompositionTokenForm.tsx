import React, { useCallback } from 'react';
import IconPlus from '@/icons/plus.svg';
import { Properties } from '@/constants/Properties';
import { SingleCompositionToken } from '@/types/tokens';
import Heading from './Heading';
import IconButton from './IconButton';
import Box from './Box';
import SingleCompositionTokenForm from './SingleCompositionTokenForm';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';

export default function CompositionTokenForm({
  internalEditToken,
  setValue,
}: {
  internalEditToken: SingleCompositionToken;
  setValue: (newTokenValue: NodeTokenRefMap) => void;
}) {

  const propertiesMenu = React.useMemo(() => (
    Object.keys(Properties).map((key: string) => (
      String(Properties[key as keyof typeof Properties])
    ))
  ), [Properties]);

  // const compositionTokenToArray = React.useMemo(() => {
  //   console.log("usememo", internalEditToken.value)
  //   if (internalEditToken.value === null) {
  //     return [newToken];
  //   }
  //   return Object.entries(internalEditToken.value).map(([key, value]) => (
  //     {
  //       property: key,
  //       value,
  //     }
  //   ));
  // }, [internalEditToken]);

  const addToken = useCallback(() => {
    // if (Array.isArray(internalEditToken.value)) {
    //   setValue([...internalEditToken.value, newToken]);
    // } else {
    //   setValue([internalEditToken.value, newToken]);
    // }
    const newTokenValue = internalEditToken.value;
    Object.defineProperty(newTokenValue, '', {
      value: ''
    });
    setValue(newTokenValue);
  }, [internalEditToken]);

  const removeToken = useCallback((property: string) => {
    const newTokenValue = internalEditToken.value;
    delete newTokenValue[property as keyof typeof Properties];
    setValue(newTokenValue);
  }, [internalEditToken]);

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
        {
          internalEditToken.value === null ? (
            <SingleCompositionTokenForm
              index={0}
              property=''
              value=''
              tokenValue={null}
              properties={propertiesMenu}
              setValue={setValue}
              onRemove={removeToken}
            />
          ) : (
            Object.entries(internalEditToken.value).map(([property, value], index) => (
              <SingleCompositionTokenForm
                key={`single-style-${index}`}
                index={index}
                property={property}
                value={value}
                tokenValue={internalEditToken.value}
                properties={propertiesMenu}
                setValue={setValue}
                onRemove={removeToken}
              />
            ))
          )
        }
      </Box>
    </div>
  );
}

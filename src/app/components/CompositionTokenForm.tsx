import React, { useCallback } from 'react';
import IconPlus from '@/icons/plus.svg';
import { Properties } from '@/constants/Properties';
import { SingleCompositionToken } from '@/types/tokens';
import Heading from './Heading';
import IconButton from './IconButton';
import Box from './Box';
import SingleCompositionTokenForm from './SingleCompositionTokenForm';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import tokenTypes from '@/config/tokenTypes';

export default function CompositionTokenForm({
  internalEditToken,
  setValue,
}: {
  internalEditToken: SingleCompositionToken;
  setValue: (newTokenValue: NodeTokenRefMap) => void;
}) {
  const [orderObj, setOrderObj] = React.useState({});

  const propertiesMenu = React.useMemo(() => (
    Object.keys(Properties).map((key: string) => (
      String(Properties[key as keyof typeof Properties])
    ))
  ), [Properties]);

  React.useEffect(() => {
    let newOrderObj: object = {};
    Object.keys(internalEditToken.value).map((key, index) => {
      Object.defineProperty(newOrderObj, key, {
        value: index
      })
    });
    console.log("didmount", newOrderObj);
    setOrderObj(newOrderObj);
  }, []);

  const arrangedTokenValue: NodeTokenRefMap = React.useMemo(() => {
    console.log("usememeo", internalEditToken.value, "orderobj", orderObj)
    let newOrderObj: object = {};
    Object.entries(internalEditToken.value).forEach(([key, value]) => {
      newOrderObj[key] = value;
    })
    console.log("neworderobjdddd", newOrderObj)
    console.log("keys", Object.keys(newOrderObj))
    console.log("sadfasfdsadf", ...Object.keys(newOrderObj).sort((a, b) => orderObj[a] - orderObj[b]))
    const res = Object.assign({}, ...Object.keys(newOrderObj).sort((a, b) => orderObj[a] - orderObj[b]).map(x => { return { [x]: newOrderObj[x]}}))
    console.log("finalnewOrder", res)
    return res;
  }, [internalEditToken, orderObj]);

  React.useEffect(() => {
    console.log("arranged", arrangedTokenValue)
    console.log("ifif", (internalEditToken.value === {}))
  }, [arrangedTokenValue])
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

  const handleOrderObj = (newOrderObj: object) => {
    console.log("setNewOrderobj", newOrderObj)
    setOrderObj(newOrderObj);
  }

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
          Object.entries(arrangedTokenValue).length < 1 ? (
            <SingleCompositionTokenForm
              index={0}
              property=''
              value=''
              tokenValue={{}}
              properties={propertiesMenu}
              orderObj={orderObj}
              setValue={setValue}
              onRemove={removeToken}
              handleOrderObj={handleOrderObj}
            />
          ) : (
            Object.entries(arrangedTokenValue).map(([property, value], index) => (
              <SingleCompositionTokenForm
                key={`single-style-${index}`}
                index={index}
                property={property}
                value={value}
                tokenValue={internalEditToken.value}
                properties={propertiesMenu}
                orderObj={orderObj}
                setValue={setValue}
                onRemove={removeToken}
                handleOrderObj={handleOrderObj}
              />
            ))
          )
        }
      </Box>
    </div>
  );
}

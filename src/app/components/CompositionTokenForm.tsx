import React, { useCallback } from 'react';
import IconPlus from '@/icons/plus.svg';
import { Properties } from '@/constants/Properties';
import { SingleCompositionToken } from '@/types/tokens';
import Heading from './Heading';
import IconButton from './IconButton';
import Box from './Box';
import SingleCompositionTokenForm from './SingleCompositionTokenForm';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { compositionTokenProperty } from '@/types/CompositionTokenProperty';

export default function CompositionTokenForm({
  internalEditToken,
  setTokenValue,
}: {
  internalEditToken: SingleCompositionToken;
  setTokenValue: (newTokenValue: NodeTokenRefMap) => void;
}) {
  const defaultOrderObj: NodeTokenRefMap = {};
  Object.keys(internalEditToken.value).map((key, index) => {
    defaultOrderObj[key as compositionTokenProperty] = String(index);
  });
  const [orderObj, setOrderObj] = React.useState(defaultOrderObj);
  const [error, setError] = React.useState(false);

  const propertiesMenu = React.useMemo(() => (
    Object.keys(Properties).map((key: string) => (
      String(Properties[key as compositionTokenProperty])
    ))
  ), [Properties]);

  // keep order of the properties in composition token
  const arrangedTokenValue = React.useMemo<NodeTokenRefMap>(() => {
    return Object.assign({}, ...Object.keys(internalEditToken.value).sort((a, b) => Number(orderObj[a as compositionTokenProperty]) - Number(orderObj[b as compositionTokenProperty]))
      .map(x => { return { [x as compositionTokenProperty]: internalEditToken.value[x as compositionTokenProperty] } }))
  }, [internalEditToken, orderObj]);

  const addToken = useCallback(() => {
    if(internalEditToken.value.hasOwnProperty('') || Object.keys(internalEditToken.value).length === 0 ) {
      setError(true);
    }
    internalEditToken.value['' as compositionTokenProperty] = '';
    setTokenValue(internalEditToken.value);
  }, [internalEditToken]);

  const removeToken = useCallback((property: string) => {
    delete internalEditToken.value[property as compositionTokenProperty];
    setTokenValue(internalEditToken.value);
  }, [internalEditToken]);

  const handleOrderObj = useCallback((newOrderObj: object) => {
    setOrderObj(newOrderObj);
  }, [orderObj])

  const handleError = useCallback((newError: boolean) => {
    setError(newError);
  }, [error])

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
              tokenValue={arrangedTokenValue}
              properties={propertiesMenu}
              error={error}
              setTokenValue={setTokenValue}
              onRemove={removeToken}
              handleOrderObj={handleOrderObj}
              handleError={handleError}
            />
          ) : (
            Object.entries(arrangedTokenValue).map(([property, value], index) => (
              <SingleCompositionTokenForm
                key={`single-style-${index}`}
                index={index}
                property={property}
                value={value}
                tokenValue={arrangedTokenValue}
                properties={propertiesMenu}
                error={error}
                setTokenValue={setTokenValue}
                onRemove={removeToken}
                handleOrderObj={handleOrderObj}
                handleError={handleError}
                />
            ))
          )
        }
      </Box>
    </div>
  );
}

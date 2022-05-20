import React, { useCallback } from 'react';
import IconPlus from '@/icons/plus.svg';
import { Properties } from '@/constants/Properties';
import { SingleCompositionToken } from '@/types/tokens';
import Heading from './Heading';
import IconButton from './IconButton';
import Box from './Box';
import SingleCompositionTokenForm from './SingleCompositionTokenForm';
import { CompositionTokenProperty } from '@/types/CompositionTokenProperty';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';

export default function CompositionTokenForm({
  internalEditToken,
  setTokenValue,
  error,
  setError
}: {
  internalEditToken: SingleCompositionToken;
  setTokenValue: (newTokenValue: NodeTokenRefMap) => void;
  error: string | null;
  setError: (newError: string | null) => void;
}) {
  const defaultOrderObj: NodeTokenRefMap = {};
  Object.keys(internalEditToken.value).map((key, index) => {
    defaultOrderObj[key as CompositionTokenProperty] = String(index);
  });
  const [orderObj, setOrderObj] = React.useState(defaultOrderObj);
  // const [error, setError] = React.useState(false);

  const propertiesMenu = React.useMemo(() => (
    Object.keys(Properties).map((key: string) => (
      String(Properties[key as CompositionTokenProperty])
    ))
  ), [Properties]);

  // keep order of the properties in composition token
  const arrangedTokenValue = React.useMemo<NodeTokenRefMap>(() => {
    return Object.assign({}, ...Object.keys(internalEditToken.value).sort((a, b) => Number(orderObj[a as CompositionTokenProperty]) - Number(orderObj[b as CompositionTokenProperty]))
      .map(x => { return { [x as CompositionTokenProperty]: internalEditToken.value[x as CompositionTokenProperty] } }))
  }, [internalEditToken, orderObj]);

  const addToken = useCallback(() => {
    if(internalEditToken.value.hasOwnProperty('') || Object.keys(internalEditToken.value).length === 0 ) {
      setError('Property must be exist');
    }
    internalEditToken.value['' as CompositionTokenProperty] = '';
    setTokenValue(internalEditToken.value as NodeTokenRefMap);
  }, [internalEditToken]);

  const removeToken = useCallback((property: string) => {
    delete internalEditToken.value[property as CompositionTokenProperty];
    setTokenValue(internalEditToken.value as NodeTokenRefMap);
  }, [internalEditToken]);

  const handleOrderObj = useCallback((newOrderObj: object) => {
    setOrderObj(newOrderObj);
  }, [orderObj])

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
              setOrderObj={handleOrderObj}
              setError={setError}
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
                setOrderObj={handleOrderObj}
                setError={setError}
                />
            ))
          )
        }
      </Box>
    </div>
  );
}

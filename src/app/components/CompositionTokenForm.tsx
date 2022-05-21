import React, { useCallback } from 'react';
import { useUIDSeed } from 'react-uid';
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
}: {
  internalEditToken: SingleCompositionToken;
  setTokenValue: (newTokenValue: NodeTokenRefMap) => void;
}) {
  const seed = useUIDSeed();
  const [orderObj, setOrderObj] = React.useState({});
  const [error, setError] = React.useState(false);
  const propertiesMenu = React.useMemo(() => (
    Object.keys(Properties).map((key: string) => (
      String(Properties[key as CompositionTokenProperty])
    ))
  ), [Properties]);

  React.useEffect(() => {
    const defaultOrderObj: NodeTokenRefMap = {};
    Object.keys(internalEditToken.value).forEach((key, index) => {
      defaultOrderObj[key as CompositionTokenProperty] = String(index);
    });
    setOrderObj(defaultOrderObj);
  }, []);

  // keep order of the properties in composition token
  const arrangedTokenValue = React.useMemo<NodeTokenRefMap>(() => (
    Object.assign({}, ...Object.keys(internalEditToken.value).sort((a, b) => Number(orderObj[a as CompositionTokenProperty]) - Number(orderObj[b as CompositionTokenProperty]))
      .map((x) => ({ [x as CompositionTokenProperty]: internalEditToken.value[x as CompositionTokenProperty] })))
  ), [internalEditToken, orderObj]);

  const addToken = useCallback(() => {
    if (internalEditToken.value.hasOwnProperty('') || Object.keys(internalEditToken.value).length === 0) {
      setError(true);
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
  }, []);

  return (
    <div>
      <Box css={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Heading size="small">Tokens</Heading>
        <IconButton
          tooltip={error ? 'Choose a property first' : 'Add another style'}
          dataCy="button-style-add-multiple"
          onClick={addToken}
          icon={<IconPlus />}
          disabled={error}
        />
      </Box>
      <Box css={{ display: 'flex', flexDirection: 'column', gap: '$4' }}>
        {
          Object.entries(arrangedTokenValue).length < 1 ? (
            <SingleCompositionTokenForm
              index={0}
              property=""
              value=""
              tokenValue={arrangedTokenValue}
              properties={propertiesMenu}
              setTokenValue={setTokenValue}
              onRemove={removeToken}
              setOrderObj={handleOrderObj}
              setError={setError}
            />
          ) : (
            Object.entries(arrangedTokenValue).map(([property, value], index) => (
              <SingleCompositionTokenForm
                key={`single-style-${seed(index)}`}
                index={index}
                property={property}
                value={value}
                tokenValue={arrangedTokenValue}
                properties={propertiesMenu}
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

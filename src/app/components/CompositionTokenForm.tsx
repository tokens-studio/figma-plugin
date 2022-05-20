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

  const propertiesMenu = React.useMemo(() => (
    Object.keys(Properties).map((key: string) => (
      String(Properties[key as compositionTokenProperty])
    ))
  ), [Properties]);

  // React.useEffect(() => {
  //   let newOrderObj: NodeTokenRefMap = {};
  //   Object.keys(internalEditToken.value).map((key, index) => {
  //     newOrderObj[key as compositionTokenProperty] = String(index);
  //   });
  //   setOrderObj(newOrderObj);
  // }, []);

  // keep order of the properties in composition token
  const arrangedTokenValue = React.useMemo<NodeTokenRefMap>(() => {
    const tokenValue = internalEditToken.value;
    return Object.assign({}, ...Object.keys(tokenValue).sort((a, b) => Number(orderObj[a as compositionTokenProperty]) - Number(orderObj[b as compositionTokenProperty]))
      .map(x => { return { [x as compositionTokenProperty]: tokenValue[x as compositionTokenProperty] } }))
  }, [internalEditToken, orderObj]);

  const addToken = useCallback(() => {
    const newTokenValue = internalEditToken.value;
    newTokenValue['' as compositionTokenProperty] = '';
    setTokenValue(newTokenValue);
  }, [internalEditToken]);

  const removeToken = useCallback((property: string) => {
    const newTokenValue = internalEditToken.value;
    delete newTokenValue[property as compositionTokenProperty];
    setTokenValue(newTokenValue);
  }, [internalEditToken]);

  const handleOrderObj = (newOrderObj: object) => {
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
              tokenValue={arrangedTokenValue}
              properties={propertiesMenu}
              setTokenValue={setTokenValue}
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
                tokenValue={arrangedTokenValue}
                properties={propertiesMenu}
                setTokenValue={setTokenValue}
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

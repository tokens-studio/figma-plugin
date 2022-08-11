import React, { useCallback } from 'react';
import { useUIDSeed } from 'react-uid';
import IconPlus from '@/icons/plus.svg';
import { Properties } from '@/constants/Properties';
import { EditTokenObject } from '@/types/tokens';
import Heading from './Heading';
import IconButton from './IconButton';
import Box from './Box';
import SingleCompositionTokenForm from './SingleCompositionTokenForm';
import { CompositionTokenProperty } from '@/types/CompositionTokenProperty';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { TokenTypes } from '@/constants/TokenTypes';
import { filterValidCompositionTokenTypes } from '@/utils/filterValidCompositionTokenTypes';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';

export default function CompositionTokenForm({
  internalEditToken,
  setTokenValue,
  resolvedTokens,
}: {
  internalEditToken: Extract<EditTokenObject, { type: TokenTypes.COMPOSITION }>;
  setTokenValue: (newTokenValue: NodeTokenRefMap) => void;
  resolvedTokens: ResolveTokenValuesResult[];
}) {
  const seed = useUIDSeed();
  const [orderObj, setOrderObj] = React.useState<NodeTokenRefMap>({});
  const [error, setError] = React.useState(false);
  const propertiesMenu = React.useMemo(() => (
    filterValidCompositionTokenTypes(Object.keys(Properties)).map((key: string) => (
      String(Properties[key as CompositionTokenProperty])
    ))
  ), []);

  React.useEffect(() => {
    const defaultOrderObj: NodeTokenRefMap = {};
    Object.keys(internalEditToken.value || internalEditToken.schema.schemas.value.properties).forEach((key, index) => {
      defaultOrderObj[key as CompositionTokenProperty] = String(index);
    });
    setOrderObj(defaultOrderObj);
  }, []);

  // keep order of the properties in composition token
  const arrangedTokenValue = React.useMemo<NodeTokenRefMap>(() => {
    const internalEditTokenValue = internalEditToken.value || internalEditToken.schema.schemas.value.properties;
    return Object.assign({}, ...Object.keys(internalEditTokenValue).sort((a, b) => Number(orderObj[a as CompositionTokenProperty]) - Number(orderObj[b as CompositionTokenProperty]))
      .map((x) => ({ [x as CompositionTokenProperty]: internalEditTokenValue[x as CompositionTokenProperty] })));
  }, [internalEditToken, orderObj]);

  const addToken = useCallback(() => {
    const internalEditTokenValue = internalEditToken.value || internalEditToken.schema.schemas.value.properties;
    if (internalEditTokenValue.hasOwnProperty('') || Object.keys(internalEditTokenValue).length === 0) {
      setError(true);
    }
    internalEditTokenValue['' as CompositionTokenProperty] = '';
    setTokenValue(internalEditTokenValue as NodeTokenRefMap);
  }, [internalEditToken]);

  const removeToken = useCallback((property: string) => {
    const internalEditTokenValue = internalEditToken.value || internalEditToken.schema.schemas.value.properties;
    const { [property as keyof typeof internalEditTokenValue]: removeProperty, ...newTokenValue } = internalEditTokenValue;
    setTokenValue(newTokenValue as NodeTokenRefMap);
  }, [internalEditToken]);

  const handleOrderObj = useCallback((newOrderObj: NodeTokenRefMap) => {
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
              propertyValue=""
              tokenValue={arrangedTokenValue}
              properties={propertiesMenu}
              resolvedTokens={resolvedTokens}
              setTokenValue={setTokenValue}
              onRemove={removeToken}
              setOrderObj={handleOrderObj}
              setError={setError}
            />
          ) : (
            Object.entries(arrangedTokenValue).map(([property, propertyValue], index) => (
              <SingleCompositionTokenForm
                key={`single-style-${seed(index)}`}
                index={index}
                property={property}
                propertyValue={propertyValue}
                tokenValue={arrangedTokenValue}
                properties={propertiesMenu}
                resolvedTokens={resolvedTokens}
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

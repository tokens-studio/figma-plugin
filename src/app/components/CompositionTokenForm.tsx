import React, { useCallback } from 'react';
import compact from 'just-compact';
import { TokenCompositionValue } from '@/types/values';
import IconPlus from '@/icons/plus.svg';
import { Properties } from '@/constants/Properties';
import { EditTokenObject } from '@/types/tokens';
import Heading from './Heading';
import IconButton from './IconButton';
import Box from './Box';
import SingleCompositionTokenForm from './SingleCompositionTokenForm';
import { TokenTypes } from '@/constants/TokenTypes';

const newToken: TokenCompositionValue = {
  property: '', value: '',
};

export default function CompositionTokenForm({
  internalEditToken,
  setValue,
}: {
  internalEditToken: Extract<EditTokenObject, { type: TokenTypes.COMPOSITION }>;
  setValue: (style: TokenCompositionValue | TokenCompositionValue[]) => void;
}) {
  const propertiesMenu = React.useMemo(() => (
    Object.keys(Properties).map((key: string) => (
      String(Properties[key as keyof typeof Properties])
    ))
  ), []);

  const addToken = useCallback(() => {
    if (Array.isArray(internalEditToken.value)) {
      setValue([...internalEditToken.value, newToken]);
    } else {
      setValue(compact([internalEditToken.value, newToken]));
    }
  }, [internalEditToken, setValue]);

  const removeToken = useCallback((index) => {
    if (Array.isArray(internalEditToken.value)) {
      setValue(internalEditToken.value.filter((_, i) => i !== index));
    }
  }, [internalEditToken, setValue]);

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
        {Array.isArray(internalEditToken.value) ? (
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
            key="single-style"
            properties={propertiesMenu}
            setValue={setValue}
            onRemove={removeToken}
          />
        )}
      </Box>
    </div>
  );
}

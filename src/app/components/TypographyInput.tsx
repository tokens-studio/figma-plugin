import React, { useState } from 'react';
import get from 'just-safe-get';
import { TokensIcon, LinkBreak2Icon } from '@radix-ui/react-icons';
import { checkIfContainsAlias } from '@/utils/alias';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import Box from './Box';
import Input from './Input';
import ResolvedValueBox from './ResolvedValueBox';
import { findReferences } from '@/utils/findReferences';
import IconButton from './IconButton';
import Heading from './Heading';
import { EditTokenObject, TokenTypeSchema } from '@/types/tokens';
import { TokenTypes } from '@/constants/TokenTypes';

export default function TypographyInput({
  internalEditToken,
  handleTypographyChange,
  handleTypographyChangeByAlias,
  resolvedTokens,
}: {
  schema: TokenTypeSchema
  internalEditToken: Extract<EditTokenObject, { type: TokenTypes.TYPOGRAPHY }>;
  handleTypographyChange: React.ChangeEventHandler;
  handleTypographyChangeByAlias: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resolvedTokens: ResolveTokenValuesResult[];
}) {
  const isAliasMode = (internalEditToken.value && typeof internalEditToken.value === 'string');
  const [mode, setMode] = useState(isAliasMode ? 'alias' : 'input');
  const [alias, setAlias] = useState('');

  const handleMode = React.useCallback(() => {
    const changeMode = (mode === 'input') ? 'alias' : 'input';
    setMode(changeMode);
    setAlias('');
  }, [mode]);

  const selectedToken = React.useMemo(() => {
    const search = typeof internalEditToken.value === 'string' ? findReferences(internalEditToken.value) : null;
    if (search && search.length > 0) {
      const nameToLookFor = search[0].slice(1, search[0].length - 1);
      const foundToken = resolvedTokens.find((t) => t.name === nameToLookFor);
      if (foundToken) return foundToken;
    }
    return null;
  }, [internalEditToken, resolvedTokens]);

  return (
    <>
      <Box css={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Heading>Typography</Heading>
        {
          mode === 'input' ? (
            <IconButton
              tooltip="alias mode"
              dataCy="button-mode-change"
              onClick={handleMode}
              icon={<TokensIcon />}
            />
          ) : (
            <IconButton
              tooltip="input mode"
              dataCy="button-mode-change"
              onClick={handleMode}
              icon={<LinkBreak2Icon />}
            />
          )
        }
      </Box>
      {(mode === 'input' && internalEditToken.schema.schemas.value.type === 'object') && (
        Object.entries(internalEditToken.schema.schemas.value.properties ?? {}).map(([key, schemaValue]) => (
          <Input
            key={key}
            full
            label={key}
            value={typeof internalEditToken.value === 'object' ? get(internalEditToken.value, key, '') : ''}
            onChange={handleTypographyChange}
            type="text"
            name={key}
            custom={schemaValue.type}
            required
          />
        ))
      )}

      {mode === 'alias' && (
      <Box css={{ display: 'flex', flexDirection: 'column', gap: '$2' }}>
        <Input
          required
          full
          label="aliasName"
          onChange={handleTypographyChangeByAlias}
          type="text"
          name="value"
          placeholder="Alias name"
          value={typeof internalEditToken.value === 'string' ? internalEditToken.value : ''}
        />
        {(
          isAliasMode
          && selectedToken
          && typeof internalEditToken.value === 'string'
          && checkIfContainsAlias(internalEditToken.value)
        ) && (
          <ResolvedValueBox
            alias={alias}
            selectedToken={selectedToken}
          />
        )}
      </Box>
      )}
    </>
  );
}

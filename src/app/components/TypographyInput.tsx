import React, { useState } from 'react';
import get from 'just-safe-get';
import { TokensIcon, LinkBreak2Icon } from '@radix-ui/react-icons';
import { useUIDSeed } from 'react-uid';
import { checkIfContainsAlias } from '@/utils/alias';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import Box from './Box';
import ResolvedValueBox from './ResolvedValueBox';
import { findReferences } from '@/utils/findReferences';
import IconButton from './IconButton';
import Heading from './Heading';
import { EditTokenObject } from '@/types/tokens';
import { TokenTypes } from '@/constants/TokenTypes';
import SingleTypographyDownShiftInput from './SingleTypographyDownShiftInput';
import DownshiftInput from './DownshiftInput';

const properties = {
  fontSize: 'fontSizes',
  fontFamily: 'fontFamilies',
  fontWeight: 'fontWeights',
  letterSpacing: 'letterSpacing',
  paragraphSpacing: 'paragraphSpacing',
  textDecoration: 'textDecoration',
  lineHeight: 'lineHeights',
  textCase: 'textCase',
};

export default function TypographyInput({
  internalEditToken,
  handleTypographyChange,
  handleTypographyChangeByAlias,
  resolvedTokens,
  handleTypographyDownShiftInputChange,
  handleDownShiftInputChange,
}: {
  internalEditToken: Extract<EditTokenObject, { type: TokenTypes.TYPOGRAPHY }>;
  handleTypographyChange: React.ChangeEventHandler;
  handleTypographyChangeByAlias: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resolvedTokens: ResolveTokenValuesResult[];
  handleTypographyDownShiftInputChange: (newInputValue: string, property: string) => void;
  handleDownShiftInputChange: (newInputValue: string) => void;
}) {
  const seed = useUIDSeed();
  const isAliasMode = (internalEditToken.value && typeof internalEditToken.value === 'string');
  const [mode, setMode] = useState(isAliasMode ? 'alias' : 'input');
  const [alias, setAlias] = useState('');

  const selectedToken = React.useMemo(() => {
    const search = findReferences(String(internalEditToken.value));
    if (search && search.length > 0) {
      const nameToLookFor = search[0].slice(1, search[0].length - 1);
      const foundToken = resolvedTokens.find((t) => t.name === nameToLookFor);
      if (foundToken) return foundToken;
    }
    return null;
  }, [internalEditToken, resolvedTokens]);

  const handleMode = React.useCallback(() => {
    const changeMode = (mode === 'input') ? 'alias' : 'input';
    setMode(changeMode);
    setAlias('');
  }, [mode]);

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
      {(mode === 'input' && internalEditToken.schema.schemas.value.type === 'object') ? (
        Object.entries(internalEditToken.schema.schemas.value.properties ?? {}).map(([key], keyIndex) => (
          <SingleTypographyDownShiftInput
            name={key}
            key={`typography-input-${seed(keyIndex)}`}
            value={typeof internalEditToken.value === 'object' ? get(internalEditToken.value, key, '') : ''}
            type={properties[key as keyof typeof properties]}
            resolvedTokens={resolvedTokens}
            handleChange={handleTypographyChange}
            setInputValue={handleTypographyDownShiftInputChange}
          />
        ))
      ) : (
        <Box css={{
          display: 'flex', flexDirection: 'column', gap: '$2',
        }}
        >
          <DownshiftInput
            value={!isAliasMode ? '' : String(internalEditToken.value)}
            type={internalEditToken.type}
            label={internalEditToken.schema.property}
            resolvedTokens={resolvedTokens}
            handleChange={handleTypographyChangeByAlias}
            setInputValue={handleDownShiftInputChange}
            placeholder="Value or {alias}"
            suffix
          />

          {isAliasMode && typeof internalEditToken.value === 'string' && checkIfContainsAlias(internalEditToken.value) && (
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

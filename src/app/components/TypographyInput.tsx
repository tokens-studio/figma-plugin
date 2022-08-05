import React, { useState } from 'react';
import get from 'just-safe-get';
import { TokensIcon, LinkBreak2Icon } from '@radix-ui/react-icons';
import { useUIDSeed } from 'react-uid';
import { checkIfContainsAlias } from '@/utils/alias';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import ResolvedTokenDisplay from './ResolvedTokenDisplay';
import { findReferences } from '@/utils/findReferences';
import IconButton from './IconButton';
import Heading from './Heading';
import { EditTokenObject } from '@/types/tokens';
import { TokenTypes } from '@/constants/TokenTypes';
import SingleTypographyDownShiftInput from './SingleTypographyDownShiftInput';
import DownshiftInput from './DownshiftInput';
import Stack from './Stack';

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
  handleTypographyValueChange,
  handleTypographyAliasValueChange,
  resolvedTokens,
  handleTypographyValueDownShiftInputChange,
  handleDownShiftInputChange,
}: {
  internalEditToken: Extract<EditTokenObject, { type: TokenTypes.TYPOGRAPHY }>;
  handleTypographyValueChange: React.ChangeEventHandler;
  handleTypographyAliasValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resolvedTokens: ResolveTokenValuesResult[];
  handleTypographyValueDownShiftInputChange: (newInputValue: string, property: string) => void;
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
    <Stack direction="column" gap={2}>
      <Stack direction="row" gap={2} justify="between" align="center">
        <Heading>Typography</Heading>
        {
          mode === 'input' ? (
            <IconButton
              tooltip="Reference"
              dataCy="mode-change-button"
              onClick={handleMode}
              icon={<TokensIcon />}
            />
          ) : (
            <IconButton
              tooltip="input mode"
              dataCy="mode-change-button"
              onClick={handleMode}
              icon={<LinkBreak2Icon />}
            />
          )
        }
      </Stack>
      {(mode === 'input' && internalEditToken.schema.schemas.value.type === 'object') ? (
        <Stack gap={2} direction="column">
          {Object.entries(internalEditToken.schema.schemas.value.properties ?? {}).map(([key], keyIndex) => (
            <SingleTypographyDownShiftInput
              name={key}
              key={`typography-input-${seed(keyIndex)}`}
              value={typeof internalEditToken.value === 'object' ? get(internalEditToken.value, key, '') : ''}
              type={properties[key as keyof typeof properties]}
              resolvedTokens={resolvedTokens}
              handleChange={handleTypographyValueChange}
              setInputValue={handleTypographyValueDownShiftInputChange}
            />
          ))}
        </Stack>
      ) : (
        <Stack direction="column" gap={2}>
          <DownshiftInput
            value={!isAliasMode ? '' : String(internalEditToken.value)}
            type={internalEditToken.type}
            label={internalEditToken.schema.property}
            inlineLabel
            resolvedTokens={resolvedTokens}
            initialName={internalEditToken.initialName}
            handleChange={handleTypographyAliasValueChange}
            setInputValue={handleDownShiftInputChange}
            placeholder="Value or {alias}"
            suffix
          />

          {isAliasMode && typeof internalEditToken.value === 'string' && checkIfContainsAlias(internalEditToken.value) && (
          <ResolvedTokenDisplay
            alias={alias}
            selectedToken={selectedToken}
          />
          )}
        </Stack>
      )}
    </Stack>
  );
}

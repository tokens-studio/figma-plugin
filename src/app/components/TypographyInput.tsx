import React, { useState } from 'react';
import { TokensIcon, LinkBreak2Icon } from '@radix-ui/react-icons';
import { checkIfContainsAlias } from '@/utils/alias';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import Box from './Box';
import Input from './Input';
import ResolvedValueBox from './ResolvedValueBox';
import { EditTokenObject } from '../store/models/uiState';
import { findReferences } from '@/utils/findReferences';
import IconButton from './IconButton';
import Heading from './Heading';

const newToken = {
  fontFamily: 'Inter',
  fontSize: 18,
  fontWeight: 'Regular',
  letterSpacing: '0%',
  lineHeight: 'AUTO',
  paragraphSpacing: 0,
  textCase: 'none',
  textDecoration: 'none',
};

export default function TypographyInput({
  internalEditToken,
  handleTypographyChange,
  handleTypographyChangeByAlias,
  resolvedTokens,
}: {
  internalEditToken: EditTokenObject;
  handleTypographyChange: React.ChangeEventHandler;
  handleTypographyChangeByAlias: React.ChangeEventHandler;
  resolvedTokens: ResolveTokenValuesResult[];
}) {
  const [mode, setMode] = useState('input');
  const [alias, setAlias] = useState('');

  const handleMode = () => {
    const changeMode = (mode === 'input') ? 'alias' : 'input';
    setMode(changeMode);
    setAlias('');
    handleTypographyChangeByAlias(newToken);
  };

  const handleAliasChange = (e) => {
    setAlias(e.target.value);
    const search = findReferences(e.target.value);
    let selectedToken;
    if (search.length > 0) {
      const nameToLookFor = search[0].slice(1, search[0].length - 1);
      selectedToken = resolvedTokens.find((t) => t.name === nameToLookFor);
    }
    handleTypographyChangeByAlias(selectedToken.value);
  };

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

            // <TokensIcon onClick={handleMode} style={{ cursor: 'pointer' }} />
            ) : (
              <IconButton
                tooltip="input mode"
                dataCy="button-mode-change"
                onClick={handleMode}
                icon={<LinkBreak2Icon />}
              />

            // <LinkBreak2Icon onClick={handleMode} style={{ cursor: 'pointer' }} />
            )
        }
      </Box>

      {
        mode === 'input' ? (
          Object.entries(internalEditToken.schema ?? {}).map(([key, schemaValue]: [string, string]) => (
            <Input
              key={key}
              full
              label={key}
              value={internalEditToken.value[key]}
              onChange={handleTypographyChange}
              type="text"
              name={key}
              custom={schemaValue}
              required
            />
          ))
        ) : (
          <Box css={{
            display: 'flex', flexDirection: 'column', gap: '$2',
          }}
          >
            <Input
              required
              full
              label="aliasName"
              onChange={(e) => handleAliasChange(e)}
              type="text"
              name="aliasName"
              placeholder="Alias name"
            />
            {
              checkIfContainsAlias(alias) && (
              <ResolvedValueBox
                alias={alias}
                resolvedTokens={resolvedTokens}
              />
              )
            }
          </Box>
        )
      }
    </>
  );
}

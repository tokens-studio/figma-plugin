import React, { useState } from 'react';
import { TokensIcon, LinkBreak2Icon } from '@radix-ui/react-icons';
import { checkIfContainsAlias } from '@/utils/alias';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import Box from './Box';
import Input from './Input';
import ResolvedValueBox from './ResolvedValueBox';
import { EditTokenObject } from '../store/models/uiState';

export default function TypographyInput({
  internalEditToken,
  handleTypographyChange,
  resolvedTokens,
}: {
  internalEditToken: EditTokenObject;
  handleTypographyChange: React.ChangeEventHandler;
  resolvedTokens: ResolveTokenValuesResult[]
}) {
  const [mode, setMode] = useState('input');
  const [alias, setAlias] = useState('');

  const handleMode = () => {
    const changeMode = (mode === 'input') ? 'alias' : 'input';
    setMode(changeMode);
  };

  const handleAliasChange = (e) => {
    setAlias(e.target.value);
  };

  return (
    <>
      <Box>
        {
          mode === 'input' ? (
            <TokensIcon onClick={handleMode} style={{ cursor: 'pointer' }} />
          ) : (
            <LinkBreak2Icon onClick={handleMode} style={{ cursor: 'pointer' }} />
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

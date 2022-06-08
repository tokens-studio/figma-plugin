import React, { useState } from 'react';
import compact from 'just-compact';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { TokensIcon, LinkBreak2Icon } from '@radix-ui/react-icons';
import { useUIDSeed } from 'react-uid';
import { checkIfContainsAlias } from '@/utils/alias';
import { findReferences } from '@/utils/findReferences';
import IconPlus from '@/icons/plus.svg';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import Heading from './Heading';
import IconButton from './IconButton';
import Box from './Box';
import ResolvedValueBox from './ResolvedValueBox';
import DownshiftInput from './DownshiftInput';
import { TokenBoxshadowValue } from '@/types/values';
import { TokenTypes } from '@/constants/TokenTypes';
import SingleBoxShadowInput, { newTokenValue } from './SingleBoxShadowInput';
import { EditTokenObject } from '@/types/tokens';

type EditTokenType = Extract<EditTokenObject, { type: TokenTypes.BOX_SHADOW }>;

export default function BoxShadowInput({
  resolvedTokens,
  internalEditToken,
  handleBoxShadowChange,
  handleBoxShadowChangeByAlias,
  handleDownShiftInputChange,
}: {
  resolvedTokens: ResolveTokenValuesResult[];
  internalEditToken: EditTokenType;
  handleBoxShadowChange: (shadow: TokenBoxshadowValue | TokenBoxshadowValue[]) => void;
  handleBoxShadowChangeByAlias: React.ChangeEventHandler;
  handleDownShiftInputChange: (newInputValue: string) => void;
}) {
  const seed = useUIDSeed();
  const isAliasMode = (internalEditToken.value && typeof internalEditToken.value === 'string');
  const [mode, setMode] = useState(isAliasMode ? 'alias' : 'input');
  const [alias, setAlias] = useState('');

  const handleMode = React.useCallback(() => {
    const changeMode = (mode === 'input') ? 'alias' : 'input';
    setMode(changeMode);
    setAlias('');
  }, [mode]);

  const selectedToken = React.useMemo(() => {
    const search = findReferences(typeof internalEditToken.value === 'string' ? internalEditToken.value : '');
    if (search && search.length > 0) {
      const nameToLookFor = search[0].slice(1, search[0].length - 1);
      const foundToken = resolvedTokens.find((t) => t.name === nameToLookFor);
      if (foundToken) return foundToken;
    }
    return null;
  }, [internalEditToken, resolvedTokens]);

  const addShadow = React.useCallback(() => {
    if (Array.isArray(internalEditToken.value)) {
      handleBoxShadowChange([...internalEditToken.value, newTokenValue]);
    } else if (typeof internalEditToken.value !== 'string') {
      handleBoxShadowChange(compact([internalEditToken.value, newTokenValue]));
    }
  }, [internalEditToken, handleBoxShadowChange]);

  const removeShadow = React.useCallback((index: number) => {
    if (Array.isArray(internalEditToken.value)) {
      handleBoxShadowChange(internalEditToken.value.filter((_, i) => i !== index));
    }
  }, [internalEditToken, handleBoxShadowChange]);

  return (
    <div>
      <Box css={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Heading size="small">Shadow</Heading>
        <Box css={{ display: 'flex' }}>
          {mode === 'input' ? (
            <IconButton
              tooltip="Reference"
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
          )}
          <IconButton
            tooltip="Add another shadow"
            dataCy="button-shadow-add-multiple"
            onClick={addShadow}
            icon={<IconPlus />}
          />
        </Box>
      </Box>
      <Box css={{ display: 'flex', flexDirection: 'column', gap: '$4' }}>
        {
          mode === 'input' ? (
            <DndProvider backend={HTML5Backend}>
              {Array.isArray(internalEditToken.value) ? (
                internalEditToken.value.map((token, index) => (
                  <SingleBoxShadowInput
                    isMultiple
                    value={internalEditToken.value as TokenBoxshadowValue[]}
                    handleBoxShadowChange={handleBoxShadowChange}
                    shadowItem={token}
                    index={index}
                    id={String(index)}
                    key={`single-shadow-${seed(index)}`}
                    onRemove={removeShadow}
                    resolvedTokens={resolvedTokens}
                  />
                ))
              ) : (
                typeof internalEditToken.value !== 'string' && (
                  <SingleBoxShadowInput
                    handleBoxShadowChange={handleBoxShadowChange}
                    index={0}
                    value={internalEditToken.value}
                    shadowItem={internalEditToken.value}
                    onRemove={removeShadow}
                    resolvedTokens={resolvedTokens}
                  />
                )
              )}
            </DndProvider>
          ) : (
            <Box css={{
              display: 'flex', flexDirection: 'column', gap: '$2',
            }}
            >
              <DownshiftInput
                value={!isAliasMode ? '' : String(internalEditToken.value)}
                type={internalEditToken.type}
                label={TokenTypes.BOX_SHADOW}
                inlineLabel
                resolvedTokens={resolvedTokens}
                handleChange={handleBoxShadowChangeByAlias}
                setInputValue={handleDownShiftInputChange}
                placeholder="Value or {alias}"
                suffix
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
          )
        }
      </Box>
    </div>
  );
}

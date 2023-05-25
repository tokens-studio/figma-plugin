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
import ResolvedTokenDisplay from './ResolvedTokenDisplay';
import DownshiftInput from './DownshiftInput';
import { TokenBoxshadowValue } from '@/types/values';
import { TokenTypes } from '@/constants/TokenTypes';
import SingleBoxShadowInput, { newTokenValue } from './SingleBoxShadowInput';
import { EditTokenObject } from '@/types/tokens';

type EditTokenType = Extract<EditTokenObject, { type: TokenTypes.BOX_SHADOW }>;

export default function BoxShadowInput({
  resolvedTokens,
  internalEditToken,
  handleBoxShadowValueChange,
  handleBoxShadowAliasValueChange,
  handleDownShiftInputChange,
  onSubmit,
}: {
  resolvedTokens: ResolveTokenValuesResult[];
  internalEditToken: EditTokenType;
  handleBoxShadowValueChange: (shadow: TokenBoxshadowValue | TokenBoxshadowValue[]) => void;
  handleBoxShadowAliasValueChange: (property: string, value: string) => void;
  handleDownShiftInputChange: (newInputValue: string) => void;
  onSubmit: () => void
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
      const foundToken = resolvedTokens.find((t) => t.name === search[0]);
      if (foundToken) return foundToken;
    }
    return null;
  }, [internalEditToken, resolvedTokens]);

  const mappedItems = React.useMemo(() => {
    if (typeof internalEditToken.value === 'string' && selectedToken) return selectedToken.value as TokenBoxshadowValue | TokenBoxshadowValue[];
    if (typeof internalEditToken.value !== 'string') return internalEditToken.value;
    return undefined;
  }, [internalEditToken.value, selectedToken]);

  const addShadow = React.useCallback(() => {
    if (Array.isArray(internalEditToken.value)) {
      handleBoxShadowValueChange([...internalEditToken.value, newTokenValue]);
    } else if (typeof internalEditToken.value === 'undefined' || typeof internalEditToken.value === 'string') {
      handleBoxShadowValueChange(compact([newTokenValue, newTokenValue]));
    } else if (typeof internalEditToken.value !== 'string') {
      handleBoxShadowValueChange(compact([internalEditToken.value, newTokenValue]));
    }
  }, [internalEditToken, handleBoxShadowValueChange]);

  const removeShadow = React.useCallback((index: number) => {
    if (Array.isArray(internalEditToken.value) && internalEditToken.value.length > 1) {
      handleBoxShadowValueChange(internalEditToken.value.filter((_, i) => i !== index));
    }
  }, [internalEditToken, handleBoxShadowValueChange]);

  return (
    <div>
      <Box css={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Heading size="small">Shadow</Heading>
        <Box css={{ display: 'flex' }}>
          {mode === 'input' ? (
            <>
              <IconButton
                tooltip="Reference mode"
                dataCy="mode-change-button"
                onClick={handleMode}
                icon={<TokensIcon />}
              />
              <IconButton
                tooltip="Add another shadow"
                dataCy="button-shadow-add-multiple"
                onClick={addShadow}
                icon={<IconPlus />}
              />
            </>
          ) : (
            <IconButton
              tooltip="Input mode"
              dataCy="mode-change-button"
              onClick={handleMode}
              icon={<LinkBreak2Icon />}
            />
          )}
        </Box>
      </Box>
      <Box css={{ display: 'flex', flexDirection: 'column', gap: '$4' }}>
        {
          mode === 'input' ? (
            <DndProvider backend={HTML5Backend}>
              {Array.isArray(mappedItems) ? (
                mappedItems.map((token, index) => (
                  <SingleBoxShadowInput
                    isMultiple
                    value={mappedItems}
                    handleBoxShadowValueChange={handleBoxShadowValueChange}
                    shadowItem={token}
                    index={index}
                    id={String(index)}
                    key={`single-shadow-${seed(index)}`}
                    onRemove={removeShadow}
                    resolvedTokens={resolvedTokens}
                    onSubmit={onSubmit}
                  />
                ))
              ) : (
                <SingleBoxShadowInput
                  handleBoxShadowValueChange={handleBoxShadowValueChange}
                  index={0}
                  value={mappedItems}
                  shadowItem={mappedItems}
                  onRemove={removeShadow}
                  resolvedTokens={resolvedTokens}
                  onSubmit={onSubmit}
                />
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
                initialName={internalEditToken.initialName}
                handleChange={handleBoxShadowAliasValueChange}
                setInputValue={handleDownShiftInputChange}
                placeholder="Value or {alias}"
                suffix
                onSubmit={onSubmit}
              />
              {(
                isAliasMode
                && selectedToken
                && typeof internalEditToken.value === 'string'
                && checkIfContainsAlias(internalEditToken.value)
              ) && (
              <ResolvedTokenDisplay
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

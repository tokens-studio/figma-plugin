import React, { useState } from 'react';
import compact from 'just-compact';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { TokensIcon, LinkBreak2Icon } from '@radix-ui/react-icons';
import { useUIDSeed } from 'react-uid';
import { IconButton, Heading } from '@tokens-studio/ui';
import { checkIfContainsAlias } from '@/utils/alias';
import { findReferences } from '@/utils/findReferences';
import IconPlus from '@/icons/plus.svg';
import { ResolveTokenValuesResult } from '@/utils/tokenHelpers';
import Box from './Box';
import ResolvedTokenDisplay from './ResolvedTokenDisplay';
import DownshiftInput from './DownshiftInput';
import { TokenColorValue } from '@/types/values';
import { TokenTypes } from '@/constants/TokenTypes';
import SingleColorInput, { newTokenValue } from './SingleColorInput';
import { EditTokenObject } from '@/types/tokens';

type EditTokenType = Extract<EditTokenObject, { type: TokenTypes.COLOR }>;

export default function MultipleColorInput({
  resolvedTokens,
  internalEditToken,
  handleColorValueChange,
  handleColorAliasValueChange,
  handleDownShiftInputChange,
  onSubmit,
}: {
  resolvedTokens: ResolveTokenValuesResult[];
  internalEditToken: EditTokenType;
  handleColorValueChange: (color: TokenColorValue | TokenColorValue[]) => void;
  handleColorAliasValueChange: (property: string, value: string) => void;
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
    if (typeof internalEditToken.value === 'string' && selectedToken) return selectedToken.value as TokenColorValue | TokenColorValue[];
    if (typeof internalEditToken.value !== 'string') return internalEditToken.value;
    return undefined;
  }, [internalEditToken.value, selectedToken]);

  const addColor = React.useCallback(() => {
    if (Array.isArray(internalEditToken.value)) {
      handleColorValueChange([...internalEditToken.value, newTokenValue]);
    } else if (typeof internalEditToken.value === 'undefined' || typeof internalEditToken.value === 'string') {
      handleColorValueChange(compact([newTokenValue, newTokenValue]));
    } else if (typeof internalEditToken.value !== 'string') {
      handleColorValueChange(compact([internalEditToken.value, newTokenValue]));
    }
  }, [internalEditToken, handleColorValueChange]);

  const removeColor = React.useCallback((index: number) => {
    if (Array.isArray(internalEditToken.value) && internalEditToken.value.length > 1) {
      handleColorValueChange(internalEditToken.value.filter((_, i) => i !== index));
    }
  }, [internalEditToken, handleColorValueChange]);

  return (
    <div>
      <Box css={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Heading size="small">Color</Heading>
        <Box css={{ display: 'flex' }}>
          {mode === 'input' ? (
            <>
              <IconButton
                tooltip="Reference mode"
                data-testid="mode-change-button"
                onClick={handleMode}
                icon={<TokensIcon />}
                variant="invisible"
                size="small"
              />
              <IconButton
                tooltip="Add another color"
                data-testid="button-color-add-multiple"
                onClick={addColor}
                icon={<IconPlus />}
                variant="invisible"
                size="small"
              />
            </>
          ) : (
            <IconButton
              tooltip="Input mode"
              data-testid="mode-change-button"
              onClick={handleMode}
              icon={<LinkBreak2Icon />}
              variant="invisible"
              size="small"
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
                  <SingleColorInput
                    isMultiple
                    value={mappedItems}
                    handleColorValueChange={handleColorValueChange}
                    colorItem={token}
                    index={index}
                    id={String(index)}
                    key={`single-color-${seed(index)}`}
                    onRemove={removeColor}
                    resolvedTokens={resolvedTokens}
                    onSubmit={onSubmit}
                  />
                ))
              ) : (
                <SingleColorInput
                  handleColorValueChange={handleColorValueChange}
                  index={0}
                  value={mappedItems}
                  colorItem={mappedItems}
                  onRemove={removeColor}
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
                label={TokenTypes.COLOR}
                inlineLabel
                resolvedTokens={resolvedTokens}
                initialName={internalEditToken.initialName}
                handleChange={handleColorAliasValueChange}
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
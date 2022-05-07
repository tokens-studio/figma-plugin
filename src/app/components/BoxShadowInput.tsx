import React from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { TokensIcon, LinkBreak2Icon } from '@radix-ui/react-icons';
import { useUIDSeed } from 'react-uid';
import { checkIfContainsAlias } from '@/utils/alias';
import { findReferences } from '@/utils/findReferences';
import IconPlus from '@/icons/plus.svg';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import { BoxShadowTypes } from '@/constants/BoxShadowTypes';
import Heading from './Heading';
import IconButton from './IconButton';
import Box from './Box';
import ResolvedValueBox from './ResolvedValueBox';
import DownshiftInput from './DownshiftInput';
import { StyledIconDisclosure, StyledInputSuffix } from './StyledInputSuffix'
import { TokenBoxshadowValue } from '@/types/values';
import { SingleBoxShadowToken } from '@/types/tokens';
import { TokenTypes } from '@/constants/TokenTypes';
import SingleBoxShadowInput from './SingleBoxShadowInput';

const newToken: TokenBoxshadowValue = {
  x: '0', y: '0', blur: '0', spread: '0', color: '#000000', type: BoxShadowTypes.INNER_SHADOW,
};

export default function BoxShadowInput({
  handleBoxShadowChange,
  handleBoxShadowChangeByAlias,
  resolvedTokens,
  internalEditToken,
  showAliasModeAutoSuggest,
  setShowAliasModeAutoSuggest,
  handleAliasModeAutoSuggest,
  handleDownShiftInputChange,
}: {
  handleBoxShadowChange: (shadow: TokenBoxshadowValue | TokenBoxshadowValue[]) => void;
  handleBoxShadowChangeByAlias: React.ChangeEventHandler;
  resolvedTokens: ResolveTokenValuesResult[];
  internalEditToken: SingleBoxShadowToken;
  showAliasModeAutoSuggest: boolean;
  setShowAliasModeAutoSuggest: (show: boolean) => void;
  handleDownShiftInputChange: (newInputValue: string) => void;
  handleAliasModeAutoSuggest: () => void;
}) {
  const seed = useUIDSeed();
  const isInputMode = (typeof internalEditToken.value === 'object');
  const [mode, setMode] = React.useState<string>(isInputMode ? 'input' : 'alias');
  const [alias, setAlias] = React.useState<string>('');

  const handleMode = React.useCallback(() => {
    const changeMode = (mode === 'input') ? 'alias' : 'input';
    setMode(changeMode);
    setAlias('');
  }, [mode]);

  const selectedToken = React.useMemo(() => {
    const search = findReferences(String(internalEditToken.value));
    if (search && search.length > 0) {
      const nameToLookFor = search[0].slice(1, search[0].length - 1);
      const foundToken = resolvedTokens.find((t) => t.name === nameToLookFor);
      if (foundToken) return foundToken;
    }
    return null;
  }, [internalEditToken, resolvedTokens]);

  const addShadow = React.useCallback(() => {
    if (Array.isArray(internalEditToken.value)) {
      handleBoxShadowChange([...internalEditToken.value, newToken]);
    } else {
      handleBoxShadowChange([internalEditToken.value, newToken]);
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
                    value={internalEditToken.value}
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
                <SingleBoxShadowInput
                  handleBoxShadowChange={handleBoxShadowChange}
                  index={0}
                  value={internalEditToken.value}
                  shadowItem={internalEditToken.value}
                  onRemove={removeShadow}
                  resolvedTokens={resolvedTokens}
                />
              )}
            </DndProvider>
          ) : (
            <Box css={{
              display: 'flex', flexDirection: 'column', gap: '$2',
            }}
            >
              <DownshiftInput
                value={isInputMode ? '' : String(internalEditToken.value)}
                type={internalEditToken.type}
                label={TokenTypes.BOX_SHADOW}
                showAutoSuggest={showAliasModeAutoSuggest}
                resolvedTokens={resolvedTokens}
                handleChange={handleBoxShadowChangeByAlias}
                setShowAutoSuggest={setShowAliasModeAutoSuggest}
                setInputValue={handleDownShiftInputChange}
                placeholder='Value or {alias}'
                suffix={(
                  <StyledInputSuffix type="button" onClick={handleAliasModeAutoSuggest}>
                    <StyledIconDisclosure />
                  </StyledInputSuffix>
                )}
              />
              {
                !isInputMode && checkIfContainsAlias(String(internalEditToken.value)) && (
                  <ResolvedValueBox
                    alias={alias}
                    selectedToken={selectedToken}
                  />
                )
              }
            </Box>
          )
        }
      </Box>
    </div>
  );
};

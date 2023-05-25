import React, { useState } from 'react';
import { useUIDSeed } from 'react-uid';
import get from 'just-safe-get';
import { TokensIcon, LinkBreak2Icon } from '@radix-ui/react-icons';
import { EditTokenObject } from '@/types/tokens';
import Heading from './Heading';
import { TokenTypes } from '@/constants/TokenTypes';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import Stack from './Stack';
import BorderTokenDownShiftInput from './BorderTokenDownShiftInput';
import ColorPicker from './ColorPicker';
import IconButton from './IconButton';
import DownshiftInput from './DownshiftInput';
import ResolvedTokenDisplay from './ResolvedTokenDisplay';
import { checkIfContainsAlias } from '@/utils/alias';
import { findReferences } from '@/utils/findReferences';

const propertyTypes = {
  color: TokenTypes.COLOR,
  width: TokenTypes.BORDER_WIDTH,
  style: 'strokeStyle',
};

export default function BorderTokenForm({
  internalEditToken,
  resolvedTokens,
  handleBorderValueChange,
  handleBorderValueDownShiftInputChange,
  handleBorderAliasValueChange,
  handleDownShiftInputChange,
  onSubmit,
}: {
  internalEditToken: Extract<EditTokenObject, { type: TokenTypes.BORDER }>;
  resolvedTokens: ResolveTokenValuesResult[];
  handleBorderValueChange: (newInputValue: string, property: string) => void;
  handleBorderValueDownShiftInputChange: (newInputValue: string, property: string) => void;
  handleBorderAliasValueChange: (property: string, value: string) => void;
  handleDownShiftInputChange: (newInputValue: string) => void;
  onSubmit: () => void
}) {
  const seed = useUIDSeed();
  const isAliasMode = (internalEditToken.value && typeof internalEditToken.value === 'string');
  const [mode, setMode] = useState(isAliasMode ? 'alias' : 'input');
  const [alias, setAlias] = useState('');
  const [inputHelperOpen, setInputHelperOpen] = useState<boolean>(false);

  const selectedToken = React.useMemo(() => {
    const search = findReferences(String(internalEditToken.value));
    if (search && search.length > 0) {
      const foundToken = resolvedTokens.find((t) => t.name === search[0]);
      if (foundToken) return foundToken;
    }
    return null;
  }, [internalEditToken, resolvedTokens]);

  const handleToggleInputHelper = React.useCallback(() => setInputHelperOpen(!inputHelperOpen), [inputHelperOpen]);
  const onColorChange = React.useCallback((color: string) => {
    handleBorderValueDownShiftInputChange(color, 'color');
  }, [handleBorderValueDownShiftInputChange]);

  const handleMode = React.useCallback(() => {
    const changeMode = (mode === 'input') ? 'alias' : 'input';
    setMode(changeMode);
    setAlias('');
  }, [mode]);

  return (
    <Stack direction="column" gap={2}>
      <Stack direction="row" gap={2} justify="between" align="center">
        <Heading>Value</Heading>
        {
          mode === 'input' ? (
            <IconButton
              tooltip="Reference mode"
              dataCy="mode-change-button"
              onClick={handleMode}
              icon={<TokensIcon />}
            />
          ) : (
            <IconButton
              tooltip="Input mode"
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
            <>
              <BorderTokenDownShiftInput
                name={key}
                key={`border-input-${seed(keyIndex)}`}
                value={typeof internalEditToken.value === 'object' ? get(internalEditToken.value, key, '') : ''}
                type={propertyTypes[key as keyof typeof propertyTypes]}
                resolvedTokens={resolvedTokens}
                handleChange={handleBorderValueChange}
                setInputValue={handleBorderValueDownShiftInputChange}
                handleToggleInputHelper={handleToggleInputHelper}
                onSubmit={onSubmit}
              />
              {inputHelperOpen && key === 'color' && (
                <ColorPicker value={typeof internalEditToken.value === 'object' && get(internalEditToken.value, key, '')} onChange={onColorChange} />
              )}
            </>
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
            handleChange={handleBorderAliasValueChange}
            setInputValue={handleDownShiftInputChange}
            placeholder="Value or {alias}"
            suffix
            onSubmit={onSubmit}
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

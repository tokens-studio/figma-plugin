import React from 'react';
import { TokensIcon, LinkBreak2Icon } from '@radix-ui/react-icons';
import { useUIDSeed } from 'react-uid';
import { checkIfContainsAlias } from '@/utils/alias';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import Box from './Box';
import ResolvedValueBox from './ResolvedValueBox';
import { EditTokenObject } from '../store/models/uiState';
import { findReferences } from '@/utils/findReferences';
import IconButton from './IconButton';
import Heading from './Heading';
import { StyledIconDisclosure, StyledInputSuffix } from './StyledInputSuffix';
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
  showAliasModeAutoSuggest,
  handleTypographyDownShiftInputChange,
  setShowAliasModeAutoSuggest,
  handleDownShiftInputChange,
  handleAliasModeAutoSuggest,
}: {
  internalEditToken: EditTokenObject;
  handleTypographyChange: React.ChangeEventHandler;
  handleTypographyChangeByAlias: React.ChangeEventHandler;
  resolvedTokens: ResolveTokenValuesResult[];
  showAliasModeAutoSuggest: boolean;
  handleTypographyDownShiftInputChange: (newInputValue: string, property: string) => void;
  setShowAliasModeAutoSuggest: (show: boolean) => void;
  handleDownShiftInputChange: (newInputValue: string) => void;
  handleAliasModeAutoSuggest: () => void;
}) {
  const seed = useUIDSeed();
  const defalutShowAutoSuggest = React.useMemo(() => {
    if (internalEditToken.value) {
      return Object.entries(internalEditToken.value).map(() => false, {});
    }
    return [false];
  }, [internalEditToken]);

  const isInputMode = (typeof internalEditToken.value === 'object');
  const [mode, setMode] = React.useState<string>(isInputMode ? 'input' : 'alias');
  const [alias, setAlias] = React.useState<string>('');
  const [showAutoSuggest, setShowAutoSuggest] = React.useState<Array<boolean>>(defalutShowAutoSuggest);

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

  const changeAutoSuggest = React.useCallback((index: number) => {
    const newShowAutoSuggest = [...showAutoSuggest];
    newShowAutoSuggest[index] = !newShowAutoSuggest[index];
    setShowAutoSuggest(newShowAutoSuggest);
  }, [showAutoSuggest]);

  const closeAutoSuggest = React.useCallback((index: number) => {
    const newAutoSuggest = [...showAutoSuggest];
    newAutoSuggest[index] = false;
    setShowAutoSuggest(newAutoSuggest);
  }, [showAutoSuggest]);

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
      {
        mode === 'input' ? (
          Object.entries(internalEditToken.value ?? {}).map(([key, value]: [string, string], keyIndex) => (
            <SingleTypographyDownShiftInput
              name={key}
              key={`typography-input-${seed(keyIndex)}`}
              keyIndex={keyIndex}
              value={value}
              type={properties[key as keyof typeof properties]}
              showAutoSuggest={showAutoSuggest[keyIndex]}
              resolvedTokens={resolvedTokens}
              handleChange={handleTypographyChange}
              setShowAutoSuggest={closeAutoSuggest}
              setInputValue={handleTypographyDownShiftInputChange}
              handleAutoSuggest={changeAutoSuggest}
            />

          ))
        ) : (
          <Box css={{
            display: 'flex', flexDirection: 'column', gap: '$2',
          }}
          >
            <DownshiftInput
              value={isInputMode ? '' : String(internalEditToken.value)}
              type={internalEditToken.type}
              label={internalEditToken.property}
              showAutoSuggest={showAliasModeAutoSuggest}
              resolvedTokens={resolvedTokens}
              handleChange={handleTypographyChangeByAlias}
              setShowAutoSuggest={setShowAliasModeAutoSuggest}
              setInputValue={handleDownShiftInputChange}
              placeholder="Value or {alias}"
              suffix={(
                <StyledInputSuffix type="button" onClick={handleAliasModeAutoSuggest}>
                  <StyledIconDisclosure />
                </StyledInputSuffix>
              )}
            />

            {
              !isInputMode && typeof internalEditToken.value === 'string' && checkIfContainsAlias(internalEditToken.value) && (
                <ResolvedValueBox
                  alias={alias}
                  selectedToken={selectedToken}
                />
              )
            }
          </Box>
        )
      }
    </>
  );
}

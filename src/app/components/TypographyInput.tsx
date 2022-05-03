import React, { useState } from 'react';
import { TokensIcon, LinkBreak2Icon } from '@radix-ui/react-icons';
import { checkIfContainsAlias } from '@/utils/alias';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import { TypographyTokenSingleValue } from '@/types/propertyTypes';
import Box from './Box';
import Input from './Input';
import ResolvedValueBox from './ResolvedValueBox';
import { EditTokenObject } from '../store/models/uiState';
import { findReferences } from '@/utils/findReferences';
import IconButton from './IconButton';
import Heading from './Heading';
import DownshiftInput from './DownshiftInput';
import { StyledIconDisclosure, StyledInputSuffix } from './StyledInputSuffix'

export default function TypographyInput({
  internalEditToken,
  handleTypographyChange,
  handleTypographyChangeByAlias,
  resolvedTokens,
  handleToggleInputHelper,
  handleTypographyDownShiftInputChange
}: {
  internalEditToken: EditTokenObject;
  handleTypographyChange: React.ChangeEventHandler;
  handleTypographyChangeByAlias: (typography: TypographyTokenSingleValue | TypographyTokenSingleValue[]) => void;
  resolvedTokens: ResolveTokenValuesResult[];
  handleToggleInputHelper: () => void;
  handleTypographyDownShiftInputChange: (newInputValue: string, property: string) => void;
}) {

  const defalutShowAutoSuggest = React.useMemo(() => {
    console.log("default")
    if (internalEditToken.value) {
      return Object.entries(internalEditToken.value).map((property) => {
        return false;
      }, {})  
    }
    return [false];
  }, [internalEditToken]);

  const isInputMode = (typeof internalEditToken.value === 'object');
  const [mode, setMode] = useState(isInputMode ? 'input' : 'alias');
  const [alias, setAlias] = useState('');
  const [showAutoSuggest, setShowAutoSuggest] = React.useState<Array<boolean>>(defalutShowAutoSuggest);

  const properties = {
    fontSize: 'fontSizes',
    fontFamily: 'fontFamilies',
    fontWeight: 'fontWeights',
    letterSpacing: 'letterSpacing',
    paragraphSpacing: 'paragraphSpacing',
    textDecoration: 'textDecoration',
    lineHeight: 'lineHeights',
    textCase: 'textCase'
  };

  const handleMode = React.useCallback(() => {
    const changeMode = (mode === 'input') ? 'alias' : 'input';
    setMode(changeMode);
    setAlias('');
  }, [mode]);

  const selectedToken = React.useMemo(() => {
    const search = findReferences(internalEditToken.value);
    if (search && search.length > 0) {
      const nameToLookFor = search[0].slice(1, search[0].length - 1);
      const foundToken = resolvedTokens.find((t) => t.name === nameToLookFor);
      if (foundToken) return foundToken;
    }
    return () => { };
  }, [internalEditToken, resolvedTokens]);

  const handleAutoSuggest = React.useCallback((index: number) => {
    let temp = [...showAutoSuggest];
    temp[index] = !temp[index];
    // showAutoSuggest.splice(index, 1, !showAutoSuggest[index]);
    // console.log("showauto", showAutoSuggest)
    setShowAutoSuggest(temp);
  }, [showAutoSuggest]);

  const closeAutoSuggest = React.useCallback((index: number) => {
    let temp = [...showAutoSuggest];
    temp[index] = false;
    // showAutoSuggest.splice(index, 1, !showAutoSuggest[index]);
    // console.log("showauto", showAutoSuggest)
    setShowAutoSuggest(temp);
  }, []);

  React.useEffect(() => {
    console.log("show", showAutoSuggest)
  }, [showAutoSuggest])
  // const handleTypographyDownShiftInputChange = React.useCallback((newInputValue: string, property: string) => {
  //   console.log("handledonwsshif");
  //   setInternalEditToken({
  //     ...internalEditToken,
  //     property: newInputValue,
  //   });
  // }, [internalEditToken]);

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
          Object.entries(internalEditToken.value ?? {}).map(([key, value]: [string, string], index) => (
            <DownshiftInput
              name={key}
              value={value}
              type={properties[key]}
              label={key}
              showAutoSuggest={showAutoSuggest[index]}
              resolvedTokens={resolvedTokens}
              handleChange={handleTypographyChange}
              setShowAutoSuggest={() => closeAutoSuggest(index)}
              setInputValue={(newInputValue: string) => handleTypographyDownShiftInputChange(newInputValue, key)}
              placeholder={
                internalEditToken.type === 'color' ? '#000000, hsla(), rgba() or {alias}' : 'Value or {alias}'
              }
              prefix={
                internalEditToken.type === 'color' && (
                  <button
                    type="button"
                    className="block w-4 h-4 rounded-sm cursor-pointer shadow-border shadow-gray-300 focus:shadow-focus focus:shadow-primary-400"
                    style={{ background: internalEditToken.value, fontSize: 0 }}
                    onClick={handleToggleInputHelper}
                  >
                    {internalEditToken.value}
                  </button>
                )
              }
              suffix={(
                <StyledInputSuffix type="button" onClick={() => handleAutoSuggest(index)}>
                  <StyledIconDisclosure />
                </StyledInputSuffix>
              )}
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
              onChange={handleTypographyChangeByAlias}
              type="text"
              name="value"
              placeholder="Alias name"
              value={isInputMode ? '' : internalEditToken.value}
            />
            {
              !isInputMode && checkIfContainsAlias(internalEditToken.value) && (
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

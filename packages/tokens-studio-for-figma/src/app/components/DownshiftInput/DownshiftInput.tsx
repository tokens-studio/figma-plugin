import React, { useCallback, useMemo } from 'react';
import Downshift from 'downshift';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box, Stack, Tooltip, Text, IconButton,
} from '@tokens-studio/ui';
import * as Popover from '@radix-ui/react-popover';
import { ResolveTokenValuesResult } from '@/utils/tokenHelpers';
import { Dispatch } from '@/app/store';
import { StyledIconDisclosure } from '../StyledInputSuffix';
import { SingleToken } from '@/types/tokens';
import { StyledPrefix } from '../Input';
import { TokenTypes } from '@/constants/TokenTypes';
import { Properties } from '@/constants/Properties';
import { isDocumentationType } from '@/utils/is/isDocumentationType';
import { useReferenceTokenType } from '@/app/hooks/useReferenceTokenType';
import { ErrorValidation } from '../ErrorValidation';
import useFigmaFonts from '@/hooks/useFigmaFonts';
import { figmaFontsSelector } from '@/selectors';
import {
  StyledButton,
  StyledDownshiftInput,
  StyledList, StyledItem, StyledItemColor, StyledItemColorDiv, StyledItemName, StyledItemValue, StyledPart,
} from './StyledDownshiftInput';
import fuzzySearch from '@/utils/fuzzySearch';
import MentionsInput from './MentionInput';
import getResolvedText from '@/utils/getResolvedTextValue';
import { getColorSwatchStyle } from '@/utils/color/getColorSwatchStyle';

type SearchField = 'Tokens' | 'Fonts' | 'Weights';

interface DownShiftProps {
  name?: string;
  type: string;
  label?: React.ReactElement | string;
  inlineLabel?: boolean;
  error?: string;
  value?: string;
  initialName?: string;
  placeholder?: string;
  prefix?: React.ReactNode;
  suffix?: boolean;
  resolvedTokens: ResolveTokenValuesResult[];
  externalFontFamily?: string;
  isComposition?: boolean;
  setInputValue(value: string): void;
  handleChange: (property: string, value: string) => void;
  handleBlur?: () => void;
  onSubmit?: () => void
}

export const DownshiftInput: React.FunctionComponent<React.PropsWithChildren<React.PropsWithChildren<DownShiftProps>>> = ({
  name,
  type,
  label,
  inlineLabel = false,
  error,
  value,
  initialName,
  prefix,
  suffix,
  placeholder,
  isComposition,
  setInputValue,
  resolvedTokens,
  externalFontFamily,
  handleChange,
  handleBlur,
  onSubmit,
}) => {
  const [showAutoSuggest, setShowAutoSuggest] = React.useState(false);
  const [searchInput, setSearchInput] = React.useState('');
  const [currentSearchField, setCurrentSearchField] = React.useState<SearchField>('Tokens');
  const dispatch = useDispatch<Dispatch>();
  const figmaFonts = useSelector(figmaFontsSelector);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const windowHeight = React.useRef(window.innerHeight);
  const downShiftContainerHeight = (windowHeight.current / 10) * 3;
  const referenceTokenTypes = useReferenceTokenType(type as TokenTypes);
  const { getFigmaFonts } = useFigmaFonts();
  const externalSearchField = useMemo<SearchField | undefined>(() => {
    if (type === TokenTypes.FONT_FAMILIES) return 'Fonts';
    if (type === TokenTypes.FONT_WEIGHTS) return 'Weights';
    return undefined;
  }, [type]);

  React.useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  React.useEffect(() => {
    if (externalSearchField === 'Fonts') {
      getFigmaFonts();
    }
  }, [externalSearchField, getFigmaFonts]);

  React.useEffect(() => {
    if (!showAutoSuggest) {
      setSearchInput('');
    }
    dispatch.uiState.setShowAutoSuggest(showAutoSuggest);
  }, [showAutoSuggest, dispatch.uiState]);

  const filteredTokenItems = useMemo(
    () => {
      let initialFilteredValues: ResolveTokenValuesResult[] = [];
      if (isDocumentationType(type as Properties)) {
        initialFilteredValues = resolvedTokens
          .filter((token: SingleToken) => token.name.toLowerCase() !== initialName?.toLowerCase()).sort((a, b) => (
            a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
          ));
      } else {
        initialFilteredValues = resolvedTokens
          .filter((token: SingleToken) => referenceTokenTypes.includes(token?.type) && token.name.toLowerCase() !== initialName?.toLowerCase()).sort((a, b) => (
            a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
          ));
      }
      if (searchInput) {
        return initialFilteredValues.filter((token: SingleToken) => fuzzySearch(searchInput.toLowerCase(), token.name.toLowerCase()));
      }
      return initialFilteredValues;
    },
    [resolvedTokens, type, initialName, referenceTokenTypes, searchInput],
  );

  const filteredValues = useMemo(() => {
    let initialFilteredValues: Array<string> = [];
    if (currentSearchField === 'Fonts') {
      initialFilteredValues = [...new Set(figmaFonts.map((font) => font.fontName.family))];
    }
    if (currentSearchField === 'Weights' && externalFontFamily) {
      initialFilteredValues = figmaFonts.filter((font) => font.fontName.family === externalFontFamily).map((selectedFont) => selectedFont.fontName.style);
    }
    if (searchInput) {
      return initialFilteredValues.filter((filteredValue: string) => fuzzySearch(searchInput, filteredValue));
    }
    return initialFilteredValues;
  }, [figmaFonts, currentSearchField, externalFontFamily, searchInput]);

  const getHighlightedText = useCallback((text: string, highlight: string) => {
    // Split on highlight term and include term into parts, ignore case
    const parts = text.split(new RegExp(`(${highlight.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
    return (
      (
        <span>
          {parts.map((part, i) => {
            const key = `${part}-${i}`;
            return (
              <StyledPart key={key} matches={part === highlight}>
                {part}
              </StyledPart>
            );
          })}
          {' '}
        </span>
      )
    );
  }, []);
    // eslint-enable react/no-array-index-key
  const handleSelect = useCallback((selectedItem: any) => {
    if (selectedItem) {
      if (currentSearchField === 'Tokens') {
        setInputValue(value?.includes('$') ? `$${selectedItem}` : `{${selectedItem}}`);
        setShowAutoSuggest(false);
      } else {
        setInputValue(selectedItem);
      }
    }
    setShowAutoSuggest(false);
  }, [setInputValue, value, currentSearchField]);

  const handleSearchInputChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((e) => {
    setSearchInput(e.target.value);
  }, []);

  const handleChangeSearchField = React.useCallback(() => {
    if (currentSearchField === 'Tokens' && externalSearchField) setCurrentSearchField(externalSearchField);
    else setCurrentSearchField('Tokens');
  }, [currentSearchField, externalSearchField]);

  const handleOnFocus = React.useCallback(() => {
    setShowAutoSuggest(false);
  }, []);

  const hasPrefix = inlineLabel || Boolean(prefix);

  return (
    <Downshift onSelect={handleSelect} isOpen={showAutoSuggest}>
      {({
        highlightedIndex, getItemProps, getInputProps,
      }) => (
        <div style={{ position: 'relative' }}>
          <Stack direction="row" justify="between" align="center" css={{ marginBottom: '$1' }}>
            {label && !inlineLabel ? <Text size="small" bold>{label}</Text> : null}
            {error ? <ErrorValidation>{error}</ErrorValidation> : null}
          </Stack>
          <Box css={{ display: 'flex', position: 'relative', width: '100%' }} className="input">
            {!!inlineLabel && !prefix && (
              <Tooltip label={name}><StyledPrefix isText css={{ height: 'auto' }}>{label}</StyledPrefix></Tooltip>
            )}
            {!!prefix && <StyledPrefix isComposition={isComposition} css={{ height: 'auto' }}>{prefix}</StyledPrefix>}
            <MentionsInput
              name={name}
              type={type}
              value={value}
              initialName={initialName}
              placeholder={placeholder}
              resolvedTokens={resolvedTokens}
              handleChange={handleChange}
              handleBlur={handleBlur}
              handleOnFocus={handleOnFocus}
              onSubmit={onSubmit}
              hasPrefix={hasPrefix}
            />
            {suffix && (
            <Popover.Root open={showAutoSuggest} onOpenChange={setShowAutoSuggest}>
              <Popover.Trigger asChild>
                <IconButton
                  data-testid="downshift-input-suffix-button"
                  icon={<StyledIconDisclosure />}
                  size="small"
                  css={{
                    borderTopLeftRadius: 0, borderBottomLeftRadius: 0, boxShadow: 'none', height: 'auto',
                  }}
                />
              </Popover.Trigger>
              {/* Using Anchor to control the width of the popover to match the parent input */}
              <Popover.Anchor style={{
                position: 'absolute', left: 0, right: 0, height: '100%', pointerEvents: 'none',
              }}
              />
              <Popover.Portal>
                <Popover.Content side="bottom" align="end" sideOffset={4} style={{ pointerEvents: 'all', width: 'var(--radix-popover-trigger-width)' }}>
                  <Box
                    css={{
                      backgroundColor: '$bgCanvas',
                      border: '1px solid',
                      borderColor: '$borderSubtle',
                      borderRadius: '$medium',
                      boxShadow: '$contextMenu',
                    }}
                  >
                    <Box
                      css={{
                        display: 'flex', flexDirection: 'column', gap: '$3', padding: '$3', borderBottom: '1px solid $borderSubtle',
                      }}
                    >
                      {
                        externalSearchField && (
                          <Box css={{ display: 'flex', gap: '$3' }}>
                            <StyledButton isFocused={currentSearchField === 'Tokens'} onClick={handleChangeSearchField}>
                              Tokens
                            </StyledButton>
                            <StyledButton isFocused={currentSearchField !== 'Tokens'} onClick={handleChangeSearchField}>
                              {externalSearchField}
                            </StyledButton>
                          </Box>
                        )
                      }
                      <StyledDownshiftInput
                        inputRef={searchInputRef}
                        value={searchInput}
                        onChange={handleSearchInputChange}
                        getInputProps={getInputProps}
                        data-testid="downshift-search-input"
                      />
                    </Box>
                    {
                      currentSearchField === 'Tokens' && filteredTokenItems.length > 0 && (
                      <StyledList className="content scroll-container" height={Math.min(downShiftContainerHeight, 30 * filteredTokenItems.length)} width="100%" itemCount={filteredTokenItems.length} itemSize={30}>
                        {({ index, style }) => {
                          const token = filteredTokenItems[index];
                          return (
                            <Tooltip
                              side="bottom"
                              label={(
                                <Stack direction="column" align="start" gap={1} css={{ wordBreak: 'break-word' }}>
                                  <StyledItemName css={{ color: '$tooltipFg' }}>
                                    {getHighlightedText(token.name, searchInput || '')}
                                  </StyledItemName>
                                  <StyledItemValue css={{ color: '$tooltipFgMuted' }}>
                                    <span>{getResolvedText(token)}</span>
                                  </StyledItemValue>
                                </Stack>
                              )}
                            >
                              <StyledItem
                                data-testid="downshift-input-item"
                                className="dropdown-item"
                                {...getItemProps({ key: token.name, index, item: token.name })}
                                isFocused={highlightedIndex === index}
                                style={style}
                              // eslint-disable-next-line react/jsx-no-bind
                                onMouseDown={() => handleSelect(token.name)}
                              >
                                {type === 'color' && (
                                <StyledItemColorDiv>
                                  <StyledItemColor style={getColorSwatchStyle(token.value.toString())} />
                                </StyledItemColorDiv>
                                )}
                                <StyledItemName truncate>
                                  {getHighlightedText(token.name, searchInput || '')}
                                </StyledItemName>
                                <StyledItemValue truncate>
                                  <span>{getResolvedText(token)}</span>
                                </StyledItemValue>
                              </StyledItem>
                            </Tooltip>
                          );
                        }}
                      </StyledList>
                      )
                    }
                    {
                      currentSearchField !== 'Tokens' && filteredValues.length > 0 && (
                        <StyledList className="content scroll-container" height={Math.min(downShiftContainerHeight, 30 * filteredValues.length)} width="100%" itemCount={filteredValues.length} itemSize={30}>
                            {({ index, style }) => {
                              const filteredValue = filteredValues[index];
                              return (
                                <Tooltip
                                  side="bottom"
                                  label={(
                                    <Stack direction="column" align="start" gap={1} css={{ wordBreak: 'break-word' }}>
                                      <StyledItemValue css={{ color: '$tooltipFg' }}>
                                        {getHighlightedText(filteredValue, searchInput || '')}
                                      </StyledItemValue>
                                    </Stack>
                              )}
                                >
                                  <StyledItem
                                    data-testid="downshift-input-item"
                                    className="dropdown-item"
                                    {...getItemProps({ key: value, index, item: value })}
                                    isFocused={highlightedIndex === index}
                                    style={style}
                                  // eslint-disable-next-line react/jsx-no-bind
                                    onMouseDown={() => handleSelect(filteredValue)}
                                  >
                                    <StyledItemName truncate>
                                      {getHighlightedText(filteredValue, searchInput || '')}
                                    </StyledItemName>
                                  </StyledItem>
                                </Tooltip>
                              );
                            }}
                        </StyledList>
                      )
                    }
                    {
                      ((currentSearchField !== 'Tokens' && filteredValues.length === 0) || (currentSearchField === 'Tokens' && filteredTokenItems.length === 0)) && (
                      <Box css={{ padding: '$3', color: '$fgMuted', fontSize: '$small' }}>
                        No suggestions found
                      </Box>
                      )
                    }
                  </Box>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
            )}
          </Box>
        </div>
      )}
    </Downshift>
  );
};

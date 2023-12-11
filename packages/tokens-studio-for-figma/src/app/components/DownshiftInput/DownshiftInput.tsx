import React, { useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
import Downshift from 'downshift';
import { useSelector, useDispatch } from 'react-redux';
import { ResolveTokenValuesResult } from '@/utils/tokenHelpers';
import { Dispatch } from '@/app/store';
import Box from '../Box';
import Text from '../Text';
import { StyledIconDisclosure, StyledInputSuffix } from '../StyledInputSuffix';
import Stack from '../Stack';
import { SingleToken } from '@/types/tokens';
import { StyledPrefix } from '../Input';
import { TokenTypes } from '@/constants/TokenTypes';
import Tooltip from '../Tooltip';
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
import { theme } from '@/stitches.config';

type SearchField = 'Tokens' | 'Fonts' | 'Weights';
type Arrow = 'top' | 'down';
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
  arrow?: Arrow;
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
  setInputValue,
  resolvedTokens,
  externalFontFamily,
  arrow = 'down',
  handleChange,
  handleBlur,
  onSubmit,
}) => {
  const [showAutoSuggest, setShowAutoSuggest] = React.useState(false);
  const [inputContainerPosX, setInputContainerPosX] = React.useState(0);
  const [inputContainerPosY, setInputContainerPosY] = React.useState(0);
  const [inputContainerWidth, setInputContainerWidth] = React.useState(0);
  const [searchInput, setSearchInput] = React.useState('');
  const [portalPlaceholder] = React.useState(document.createElement('div'));
  const [currentSearchField, setCurrentSearchField] = React.useState<SearchField>('Tokens');
  const dispatch = useDispatch<Dispatch>();
  const figmaFonts = useSelector(figmaFontsSelector);
  const inputContainerRef = React.useRef<HTMLDivElement>(null);
  const downShiftSearchContainerRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const portalRef = React.useRef<HTMLDivElement>(null);
  const blankBoxRef = React.useRef<HTMLDivElement>(null);
  const windowHeight = React.useRef(window.innerHeight);
  const downShiftContainerHeight = (windowHeight.current / 10) * 3;
  const referenceTokenTypes = useReferenceTokenType(type as TokenTypes);
  const { getFigmaFonts } = useFigmaFonts();
  const portalContainer = document.body;
  const externalSearchField = useMemo<SearchField | undefined>(() => {
    if (type === TokenTypes.FONT_FAMILIES) return 'Fonts';
    if (type === TokenTypes.FONT_WEIGHTS) return 'Weights';
    return undefined;
  }, [type]);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if ((downShiftSearchContainerRef.current && event.target instanceof Node && !downShiftSearchContainerRef.current.contains(event.target))
     && (inputContainerRef.current && event.target instanceof Node && !inputContainerRef.current.contains(event.target))) {
      setShowAutoSuggest(false);
    }
  }, []);

  type RectsType = {
    inputContainerRect?: DOMRect;
    portalRect?: DOMRect;
    blankBoxRect?: DOMRect;
  };

  const [rects, setRects] = React.useState<RectsType>({});
  const updateRects = React.useCallback(() => {
    setRects({
      inputContainerRect: inputContainerRef.current?.getBoundingClientRect(),
      portalRect: portalRef.current?.getBoundingClientRect(),
      blankBoxRect: blankBoxRef.current?.getBoundingClientRect(),
    });
  }, []);

  React.useEffect(() => {
    updateRects();
    window.addEventListener('resize', updateRects);
    window.addEventListener('scroll', updateRects);
    return () => {
      window.removeEventListener('resize', updateRects);
      window.removeEventListener('scroll', updateRects);
    };
  }, [updateRects]);

  React.useEffect(() => {
    if (portalContainer) {
      portalContainer.appendChild(portalPlaceholder);
    }
    if (rects.inputContainerRect) {
      setInputContainerPosX(rects.inputContainerRect.left);
      setInputContainerWidth(rects.inputContainerRect.width);
      if (arrow === 'down') {
        setInputContainerPosY(rects.inputContainerRect.bottom);
      } else if (rects.portalRect && rects.blankBoxRect) {
        const suggestionHeight = rects.blankBoxRect.top - rects.portalRect.height - 10;
        setInputContainerPosY(suggestionHeight);
      }
    }
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [arrow, portalContainer, portalPlaceholder, rects]);

  React.useEffect(() => {
    if (externalSearchField === 'Fonts') {
      getFigmaFonts();
    }
  }, [externalSearchField, getFigmaFonts]);

  React.useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [handleClickOutside]);

  React.useEffect(() => {
    if (!showAutoSuggest) {
      setSearchInput('');
    }
    dispatch.uiState.setShowAutoSuggest(showAutoSuggest);
  }, [showAutoSuggest, dispatch.uiState]);

  const filteredTokenItems = useMemo(
    () => {
      let initialFilteredValues:ResolveTokenValuesResult[] = [];
      if (isDocumentationType(type as Properties)) {
        initialFilteredValues = resolvedTokens
          .filter((token: SingleToken) => token.name !== initialName).sort((a, b) => (
            a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
          ));
      } else {
        initialFilteredValues = resolvedTokens
          .filter((token: SingleToken) => referenceTokenTypes.includes(token?.type) && token.name !== initialName).sort((a, b) => (
            a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
          ));
      }
      if (searchInput) {
        return initialFilteredValues.filter((token: SingleToken) => fuzzySearch(searchInput, token.name));
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
      } else {
        setInputValue(selectedItem);
      }
    }
    setShowAutoSuggest(false);
  }, [setInputValue, value, currentSearchField]);

  const handleAutoSuggest = React.useCallback(() => {
    setShowAutoSuggest(!showAutoSuggest);
  }, [showAutoSuggest]);

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

  const scrollbarWidth = useMemo(() => parseInt(theme.sizes.scrollbarWidth.value.toString(), 10) / 2, []);

  return (
    <Downshift onSelect={handleSelect} isOpen={showAutoSuggest}>
      {({
        selectedItem, highlightedIndex, getItemProps, isOpen, getInputProps,
      }) => (
        <div style={{ position: 'relative' }}>
          <Stack direction="row" justify="between" align="center" css={{ marginBottom: '$1' }}>
            {label && !inlineLabel ? <Text size="small" bold>{label}</Text> : null}
            {error ? <ErrorValidation>{error}</ErrorValidation> : null}
          </Stack>
          <Box css={{ display: 'flex', position: 'relative', width: '100%' }} className="input" ref={inputContainerRef}>
            {!!inlineLabel && !prefix && <Tooltip label={name}><StyledPrefix isText>{label}</StyledPrefix></Tooltip>}
            {!!prefix && <StyledPrefix>{prefix}</StyledPrefix>}
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
            />
            {suffix && (
              <StyledInputSuffix type="button" data-testid="downshift-input-suffix-button" onClick={handleAutoSuggest}>
                <StyledIconDisclosure />
              </StyledInputSuffix>
            )}
          </Box>
          {selectedItem?.name !== searchInput
            && isOpen ? (
              <>
                {ReactDOM.createPortal(
                  <Box
                    css={{
                      backgroundColor: '$bgDefault',
                      border: '1px solid',
                      borderColor: '$borderSubtle',
                      borderRadius: '$medium',
                      position: 'absolute',
                      width: `${inputContainerWidth}px`,
                      top: '$1',
                      boxShadow: '$contextMenu',
                      zIndex: '10',
                      transform: `translate(${inputContainerPosX}px, ${inputContainerPosY}px)`,
                    }}
                    ref={portalRef}
                  >
                    <Box
                      css={{
                        display: 'flex', flexDirection: 'column', gap: '$3', padding: '$3',
                      }}
                      ref={downShiftSearchContainerRef}
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
                      <StyledList className="content scroll-container" height={Math.min(downShiftContainerHeight, 30 * filteredTokenItems.length)} width={inputContainerWidth - scrollbarWidth} itemCount={filteredTokenItems.length} itemSize={30}>
                        {({ index, style }) => {
                          const token = filteredTokenItems[index];
                          return (
                            <StyledItem
                              data-testid="downshift-input-item"
                              className="dropdown-item"
                              {...getItemProps({ key: token.name, index, item: token.name })}
                              css={{
                                backgroundColor: highlightedIndex === index ? '$accentDefault' : '$bgDefault',
                              }}
                              isFocused={highlightedIndex === index}
                              style={style}
                                  // eslint-disable-next-line react/jsx-no-bind
                              onMouseDown={() => handleSelect(token.name)}
                            >
                              {type === 'color' && (
                              <StyledItemColorDiv>
                                <StyledItemColor style={{ backgroundColor: token.value.toString() }} />
                              </StyledItemColorDiv>
                              )}
                              <StyledItemName>{getHighlightedText(token.name, searchInput || '')}</StyledItemName>
                              <StyledItemValue>{getResolvedText(token)}</StyledItemValue>
                            </StyledItem>
                          );
                        }}
                      </StyledList>
                      )
                    }
                    {
                      currentSearchField !== 'Tokens' && filteredValues.length > 0 && (
                        <StyledList className="content scroll-container" height={Math.min(downShiftContainerHeight, 30 * filteredValues.length)} width={inputContainerWidth - scrollbarWidth} itemCount={filteredValues.length} itemSize={30}>
                            {({ index, style }) => {
                              const filteredValue = filteredValues[index];
                              return (
                                <StyledItem
                                  data-testid="downshift-input-item"
                                  className="dropdown-item"
                                  {...getItemProps({ key: value, index, item: value })}
                                  css={{
                                    backgroundColor: highlightedIndex === index ? '$accentDefault' : '$bgDefault',
                                  }}
                                  isFocused={highlightedIndex === index}
                                  style={style}
                                  // eslint-disable-next-line react/jsx-no-bind
                                  onMouseDown={() => handleSelect(value)}
                                >
                                  <StyledItemName>{getHighlightedText(filteredValue, searchInput || '')}</StyledItemName>
                                </StyledItem>
                              );
                            }}
                        </StyledList>
                      )
                    }
                    {
                      ((currentSearchField !== 'Tokens' && filteredValues.length === 0) || (currentSearchField === 'Tokens' && filteredTokenItems.length === 0)) && (
                        <Box ref={blankBoxRef}>
                          <Box css={{ padding: '$3', color: '$fgMuted', fontSize: '$small' }}>
                            No suggestions found
                          </Box>
                        </Box>
                      )
                    }
                  </Box>,
                  portalPlaceholder,
                )}
              </>
            ) : null}
        </div>
      )}
    </Downshift>
  );
};

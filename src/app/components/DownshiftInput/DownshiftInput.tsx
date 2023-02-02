import React, { useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
import Downshift from 'downshift';
import { useSelector } from 'react-redux';
import Fuse from 'fuse.js';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import Box from '../Box';
import Text from '../Text';
import { StyledIconDisclosure, StyledInputSuffix } from '../StyledInputSuffix';
import Stack from '../Stack';
import { SingleToken } from '@/types/tokens';
import Input, { StyledPrefix } from '../Input';
import { TokenTypes } from '@/constants/TokenTypes';
import Tooltip from '../Tooltip';
import { Properties } from '@/constants/Properties';
import { isDocumentationType } from '@/utils/is/isDocumentationType';
import { useReferenceTokenType } from '@/app/hooks/useReferenceTokenType';
import { ErrorValidation } from '../ErrorValidation';
import useFigmaFonts from '@/hooks/useFigmaFonts';
import { figmaFontsSelector } from '@/selectors';
import { MentionInput } from './MentionInput';
import {
  StyledButton,
  StyledDropdown, StyledItem, StyledItemColor, StyledItemColorDiv, StyledItemName, StyledItemValue, StyledPart,
} from './StyledDownshiftInput';

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
  setInputValue(value: string): void;
  handleChange: React.ChangeEventHandler<HTMLInputElement>;
  handleBlur?: () => void;
}

export const DownshiftInput: React.FunctionComponent<DownShiftProps> = ({
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
  handleChange,
  handleBlur,
}) => {
  const [showAutoSuggest, setShowAutoSuggest] = React.useState<boolean>(false);
  const [inputContainerPosX, setInputContainerPosX] = React.useState(0);
  const [inputContainerPosY, setInputContainerPosY] = React.useState(0);
  const [inputContainerWith, setInputContainerWith] = React.useState(0);
  const [searchInput, setSearchInput] = React.useState('');
  const [portalPlaceholder] = React.useState(document.createElement('div'));
  const [currentSearchField, setCurrentSearchField] = React.useState<SearchField>('Tokens');
  const figmaFonts = useSelector(figmaFontsSelector);
  const inputContainerRef = React.useRef<HTMLDivElement>(null);
  const downShiftContainerRef = React.useRef<HTMLDivElement>(null);
  const referenceTokenTypes = useReferenceTokenType(type as TokenTypes);
  const { getFigmaFonts } = useFigmaFonts();
  const portalContainer = document.getElementById('app');
  const externalSearchField = useMemo<SearchField | undefined>(() => {
    if (type === TokenTypes.FONT_FAMILIES) return 'Fonts';
    if (type === TokenTypes.FONT_WEIGHTS) return 'Weights';
    return undefined;
  }, [type]);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (downShiftContainerRef.current && event.target instanceof Node && !downShiftContainerRef.current.contains(event.target) && showAutoSuggest) {
      setShowAutoSuggest(false);
    }
  }, [showAutoSuggest]);

  React.useEffect(() => {
    if (portalContainer) {
      portalContainer.appendChild(portalPlaceholder);
    }
    if (inputContainerRef.current) {
      const boundingRect = inputContainerRef.current?.getBoundingClientRect();
      setInputContainerPosX(boundingRect.left);
      setInputContainerPosY(boundingRect.bottom);
      setInputContainerWith(boundingRect.width);
    }
  }, []);

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
        const searchResult = new Fuse(initialFilteredValues, { keys: ['name'] }).search(searchInput);
        return searchResult.map((searchItem) => searchItem.item);
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
      const searchResult = new Fuse(initialFilteredValues).search(searchInput);
      return searchResult.map((searchItem) => searchItem.item);
    }
    return initialFilteredValues;
  }, [figmaFonts, currentSearchField, externalFontFamily, searchInput]);

  const getHighlightedText = useCallback((text: string, highlight: string) => {
    // Split on highlight term and include term into parts, ignore case
    const parts = text.split(new RegExp(`(${highlight.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <StyledPart key={i} matches={part === highlight}>
            {part}
          </StyledPart>
        ))}
        {' '}
      </span>
    );
  }, []);

  const getResolveValue = useCallback((token: SingleToken) => {
    let returnValue: string = '';
    if (token.type === TokenTypes.TYPOGRAPHY || token.type === TokenTypes.BOX_SHADOW) {
      if (Array.isArray(token.value)) {
        returnValue = token.value.reduce<string>((totalAcc, item) => {
          const singleReturnValue = Object.entries(item).reduce<string>((acc, [, propertyValue]) => (
            `${acc}${propertyValue.toString()}/`
          ), '');
          return `${totalAcc}${singleReturnValue},`;
        }, '');
      } else {
        returnValue = Object.entries(token.value).reduce<string>((acc, [, propertyValue]) => (
          `${acc}${propertyValue.toString()}/`
        ), '');
      }
    } else if (token.type === TokenTypes.COMPOSITION) {
      returnValue = Object.entries(token.value).reduce<string>((acc, [property, value]) => (
        `${acc}${property}:${value}`
      ), '');
    } else if (typeof token.value === 'string' || typeof token.value === 'number') {
      returnValue = token.value;
    }
    return returnValue;
  }, []);

  const handleSelect = useCallback((selectedItem: any) => {
    if (currentSearchField === 'Tokens') {
      setInputValue(value?.includes('$') ? `$${selectedItem}` : `{${selectedItem}}`);
    } else {
      setInputValue(selectedItem);
    }
    setShowAutoSuggest(false);
  }, [setInputValue, setShowAutoSuggest, value, currentSearchField]);

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

  return (
    <Downshift onSelect={handleSelect}>
      {({
        selectedItem, highlightedIndex, getItemProps,
      }) => (
        <div style={{ position: 'relative' }} ref={downShiftContainerRef}>
          <Stack direction="row" justify="between" align="center" css={{ marginBottom: '$1' }}>
            {label && !inlineLabel ? <Text size="small" bold>{label}</Text> : null}
            {error ? <ErrorValidation>{error}</ErrorValidation> : null}
          </Stack>
          <Box css={{ display: 'flex', position: 'relative', width: '100%' }} className="input" ref={inputContainerRef}>
            {!!inlineLabel && !prefix && <Tooltip label={name}><StyledPrefix isText>{label}</StyledPrefix></Tooltip>}
            {!!prefix && <StyledPrefix>{prefix}</StyledPrefix>}
            <MentionInput
              name={name}
              type={type}
              value={value}
              initialName={initialName}
              placeholder={placeholder}
              resolvedTokens={resolvedTokens}
              inputContainerWith={inputContainerWith}
              inputContainerPosX={inputContainerPosX}
              inputContainerPosY={inputContainerPosY}
              handleChange={handleChange}
              handleBlur={handleBlur}
              portalPlaceholder={portalPlaceholder}
            />
            {suffix && (
              <StyledInputSuffix type="button" data-testid="downshift-input-suffix-button" onClick={handleAutoSuggest}>
                <StyledIconDisclosure />
              </StyledInputSuffix>
            )}
          </Box>
          {selectedItem?.name !== searchInput
            && showAutoSuggest ? (
              ReactDOM.createPortal(
                <Box css={{
                  position: 'absolute', top: '0', width: `${inputContainerWith}px`, zIndex: '10', transform: `translate(${inputContainerPosX}px, ${inputContainerPosY}px)`,
                }}
                >
                  <Box css={{
                    display: 'flex', flexDirection: 'column', gap: '$3', backgroundColor: '$bgDefault', boxShadow: '$contextMenu', padding: '$3 $3', borderRadius: '$3 $3 0 0',
                  }}
                  >
                    <Box css={{ display: 'flex', gap: '$3' }}>
                      <StyledButton isFocused={currentSearchField === 'Tokens'} onClick={handleChangeSearchField}>
                        Tokens
                      </StyledButton>
                      {
                        externalSearchField && (
                          <StyledButton isFocused={currentSearchField !== 'Tokens'} onClick={handleChangeSearchField}>
                            {externalSearchField}
                          </StyledButton>
                        )
                      }
                    </Box>
                    <Input
                      full
                      value={searchInput}
                      onChange={handleSearchInputChange}
                      type="text"
                      autofocus
                      placeholder="Search"
                    />
                  </Box>
                  <StyledDropdown className="content scroll-container">
                    {
                      currentSearchField === 'Tokens' ? (
                        filteredTokenItems.map((token: SingleToken, index: number) => (
                          <StyledItem
                            data-cy="downshift-input-item"
                            data-testid="downshift-input-item"
                            className="dropdown-item"
                            {...getItemProps({ key: token.name, index, item: token.name })}
                            css={{
                              backgroundColor: highlightedIndex === index ? '$interaction' : '$bgDefault',
                            }}
                            isFocused={highlightedIndex === index}
                          >
                            {type === 'color' && (
                            <StyledItemColorDiv>
                              <StyledItemColor style={{ backgroundColor: token.value.toString() }} />
                            </StyledItemColorDiv>
                            )}
                            <StyledItemName>{getHighlightedText(token.name, searchInput || '')}</StyledItemName>
                            <StyledItemValue>{getResolveValue(token)}</StyledItemValue>
                          </StyledItem>
                        ))
                      ) : (
                        filteredValues?.map((value, index) => (
                          <StyledItem
                            data-cy="downshift-input-item"
                            data-testid="downshift-input-item"
                            className="dropdown-item"
                            {...getItemProps({ key: value, index, item: value })}
                            css={{
                              backgroundColor: highlightedIndex === index ? '$interaction' : '$bgDefault',
                            }}
                            isFocused={highlightedIndex === index}
                          >
                            <StyledItemName>{getHighlightedText(value, searchInput || '')}</StyledItemName>
                          </StyledItem>
                        ))
                      )
                    }
                  </StyledDropdown>
                </Box>,
                portalPlaceholder,
              )
            ) : null}
        </div>
      )}
    </Downshift>
  );
};

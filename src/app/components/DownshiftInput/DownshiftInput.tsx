import React, { useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
import Downshift from 'downshift';
import { Mention, MentionsInput, SuggestionDataItem } from 'react-mentions';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import Box from '../Box';
import Text from '../Text';
import { StyledIconDisclosure, StyledInputSuffix } from '../StyledInputSuffix';
import Stack from '../Stack';
import { SingleToken } from '@/types/tokens';
import Input, { StyledPrefix } from '../Input';
import { TokenTypes } from '@/constants/TokenTypes';
import { styled } from '@/stitches.config';
import Tooltip from '../Tooltip';
import { Properties } from '@/constants/Properties';
import { isDocumentationType } from '@/utils/is/isDocumentationType';
import { useReferenceTokenType } from '@/app/hooks/useReferenceTokenType';
import mentionInputStyles from './mentionInputStyle';
import { ErrorValidation } from '../ErrorValidation';

type SearchField = 'Tokens' | 'Fonts' | 'Weights';

const StyledDropdown = styled('div', {
  position: 'absolute',
  zIndex: '10',
  width: '100%',
  maxHeight: '300px',
  borderRadius: '$contextMenu',
  overflowY: 'scroll',
  backgroundColor: '$bgDefault',
  marginTop: '1px',
  cursor: 'pointer',
  boxShadow: '$contextMenu',
});

const StyledItemValue = styled('div', {
  color: '$textMuted',
  fontWeight: '$bold',
  textAlign: 'right',
  textTransform: 'uppercase',
  maxWidth: '300px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const StyledItem = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  padding: '$2 $3',
  fontSize: '$xsmall',
  variants: {
    isFocused: {
      true: {
        backgroundColor: '$interaction',
        color: '$onInteraction',
        [`& ${StyledItemValue}`]: {
          color: '$onInteraction',
        },
      },
    },
  },
});

const StyledItemColorDiv = styled('div', {
  flexShrink: 0,
});

const StyledItemColor = styled('div', {
  width: '16px',
  height: '16px',
  borderRadius: '$colorSwatch',
  border: '1px solid',
  borderColor: '$borderMuted',
});

const StyledItemName = styled('div', {
  flexGrow: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const StyledPart = styled('span', {
  variants: {
    matches: {
      true: {
        fontWeight: '$bold',
      },
    },
  },
});

const StyledButton = styled('button', {
  padding: '$2 $3',
  fontSize: '$xsmall',

  variants: {
    isFocused: {
      false: {
        color: '$textDisabled',
      },
    },
  },
});

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
  handleChange,
  handleBlur,
}) => {
  const [showAutoSuggest, setShowAutoSuggest] = React.useState<boolean>(false);
  const [inputContainerPosX, setInputContainerPosX] = React.useState(0);
  const [inputContainerPosY, setInputContainerPosY] = React.useState(0);
  const [inputContainerWith, setInputContainerWith] = React.useState(0);
  const portalContainer = document.getElementById('app');
  const [portalPlaceholder] = React.useState(document.createElement('div'));
  const inputContainerRef = React.useRef<HTMLDivElement>(null);
  const referenceTokenTypes = useReferenceTokenType(type as TokenTypes);
  const [searchInput, setSearchInput] = React.useState('');
  const [currentSearchField, setCurrentSearchField] = React.useState<SearchField>('Tokens');
  const externalSearchField = useMemo<SearchField | undefined>(() => {
    if (type === TokenTypes.FONT_FAMILIES) return 'Fonts';
    if (type === TokenTypes.FONT_WEIGHTS) return 'Weights';
    return undefined;
  }, [type]);
  // const handleClickOutside = useCallback((event: MouseEvent) => {
  //   if (inputContainerRef.current && event.target instanceof Node && !inputContainerRef.current.contains(event.target) && showAutoSuggest) {
  //     setShowAutoSuggest(false);
  //   }
  // }, [showAutoSuggest]);

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

  // React.useEffect(() => {
  //   document.addEventListener('click', handleClickOutside);
  //   return () => {
  //     document.removeEventListener('click', handleClickOutside);
  //   };
  // }, [handleClickOutside]);

  const filteredTokenItems = useMemo(
    () => {
      if (isDocumentationType(type as Properties)) {
        return resolvedTokens
          .filter(
            (token: SingleToken) => !searchInput || token.name.toLowerCase().includes(searchInput.toLowerCase()),
          )
          .filter((token: SingleToken) => token.name !== initialName).sort((a, b) => (
            a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
          ));
      }
      return resolvedTokens
        .filter(
          (token: SingleToken) => !searchInput || token.name.toLowerCase().includes(searchInput.toLowerCase()),
        )
        .filter((token: SingleToken) => referenceTokenTypes.includes(token?.type) && token.name !== initialName).sort((a, b) => (
          a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
        ));
    },
    [resolvedTokens, searchInput, type, initialName, referenceTokenTypes],
  );

  const mentionData = useMemo<SuggestionDataItem[]>(() => {
    if (isDocumentationType(type as Properties)) {
      return resolvedTokens
        .filter((token: SingleToken) => token.name !== initialName).sort((a, b) => (
          a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
        )).map((resolvedToken) => ({
          id: resolvedToken.name,
          display: resolvedToken.name,
        }));
    }
    return resolvedTokens
      .filter((token: SingleToken) => referenceTokenTypes.includes(token?.type) && token.name !== initialName).sort((a, b) => (
        a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
      )).map((resolvedToken) => ({
        id: resolvedToken.name,
        display: resolvedToken.name,
      }));
  }, [initialName, resolvedTokens, referenceTokenTypes, type]);

  const getHighlightedText = useCallback((text: string, highlight: string) => {
    // Split on highlight term and include term into parts, ignore case
    const parts = text.split(new RegExp(`(${highlight.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <StyledPart key={i} matches={part.toLowerCase() === highlight.toLowerCase()}>
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
    setInputValue(value?.includes('$') ? `$${selectedItem.name}` : `{${selectedItem.name}}`);
    setShowAutoSuggest(false);
  }, [setInputValue, setShowAutoSuggest, value]);

  const handleAutoSuggest = React.useCallback(() => {
    setShowAutoSuggest(!showAutoSuggest);
  }, [showAutoSuggest]);

  const handleInputBlur = React.useCallback(() => {
    if (handleBlur) {
      handleBlur();
    }
  }, [handleBlur]);

  const handleMentionInputChange = React.useCallback((e) => {
    e.target.name = name ?? 'value';
    handleChange(e);
  }, [handleChange, name]);

  const handleSearchInputChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((e) => {
    setSearchInput(e.target.value);
  }, []);

  const handleChangeSearchField = React.useCallback(() => {
    if (currentSearchField === 'Tokens' && externalSearchField) setCurrentSearchField(externalSearchField);
    else setCurrentSearchField('Tokens');
  }, [currentSearchField, externalSearchField]);

  const renderMentionList = React.useCallback((children: React.ReactNode) => ReactDOM.createPortal(
    <Box css={{
      position: 'absolute', background: '$bgDefault', top: '0', width: `${inputContainerWith}px`, padding: '$2', zIndex: '10', transform: `translate(${inputContainerPosX}px, ${inputContainerPosY}px)`,
    }}
    >
      <StyledDropdown className="content scroll-container">
        {children}
      </StyledDropdown>
    </Box>,
    portalPlaceholder,
  ), [inputContainerWith, inputContainerPosX, inputContainerPosY, portalPlaceholder]);

  const renderMentionListItem = React.useCallback((
    suggestion: SuggestionDataItem,
    search,
    highlightedDisplay,
    focused,
  ) => {
    const resolvedToken = resolvedTokens.find((token) => token.type === type && token.name === suggestion.id);
    return (
      <StyledItem
        data-cy="downshift-input-item"
        data-testid="downshift-input-item"
        className="dropdown-item"
        css={{
          backgroundColor: focused ? '$interaction' : '$bgDefault', width: '100%', padding: '0',
        }}
        isFocused={focused}
      >
        {type === 'color' && (
          <StyledItemColorDiv>
            <StyledItemColor style={{ backgroundColor: resolvedToken?.value.toString() }} />
          </StyledItemColorDiv>
        )}
        <StyledItemName css={{ flexGrow: '1' }}>{getHighlightedText(resolvedToken?.name ?? '', search || '')}</StyledItemName>
        <StyledItemValue>{resolvedToken?.value}</StyledItemValue>
      </StyledItem>
    );
  }, [resolvedTokens, type]);

  const renderDisplayTransform = React.useCallback((id: string, display: string) => `{${display}}`, []);

  return (
    <Downshift onSelect={handleSelect}>
      {({
        selectedItem, highlightedIndex, getItemProps,
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
              singleLine
              style={{ ...mentionInputStyles }}
              value={value}
              onChange={handleMentionInputChange}
              placeholder={placeholder}
              autoComplete="off"
              allowSpaceInQuery={false}
              customSuggestionsContainer={renderMentionList}
              onBlur={handleInputBlur}
              name={name}
            >
              <Mention
                trigger="{"
                data={mentionData}
                markup=" __id__ "
                renderSuggestion={renderMentionListItem}
                displayTransform={renderDisplayTransform}
              />
            </MentionsInput>
            {suffix && (
              <StyledInputSuffix type="button" data-testid="downshift-input-suffix-button" onClick={handleAutoSuggest}>
                <StyledIconDisclosure />
              </StyledInputSuffix>
            )}
          </Box>
          {filteredTokenItems
            && filteredTokenItems.length > 0
            && selectedItem?.name !== searchInput
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
                    {filteredTokenItems.map((token: SingleToken, index: number) => (
                      <StyledItem
                        data-cy="downshift-input-item"
                        data-testid="downshift-input-item"
                        className="dropdown-item"
                        {...getItemProps({ key: token.name, index, item: token })}
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
                    ))}
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

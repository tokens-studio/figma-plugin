import React, { useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
import Downshift from 'downshift';
import { Mention, MentionsInput as Input, SuggestionDataItem } from 'react-mentions';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import Box from '../Box';
import { StyledIconDisclosure, StyledInputSuffix } from '../StyledInputSuffix';
import Stack from '../Stack';
import { SingleToken } from '@/types/tokens';
import { StyledPrefix } from '../Input';
import { TokenTypes } from '@/constants/TokenTypes';
import { styled } from '@/stitches.config';
import { StyledDownshiftInput } from './StyledDownshiftInput';
import Tooltip from '../Tooltip';
import { Properties } from '@/constants/Properties';
import { isDocumentationType } from '@/utils/is/isDocumentationType';
import { useReferenceTokenType } from '@/app/hooks/useReferenceTokenType';
import mentionInputStyles from './mentionInputStyle';

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
  handleBlur?: React.ChangeEventHandler<HTMLInputElement>;
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

  const filteredValue = useMemo(() => ((showAutoSuggest || typeof value !== 'string') ? '' : value?.replace(/[{}$]/g, '')), [
    showAutoSuggest,
    value,
  ]); // removing non-alphanumberic except . from the input value
  const referenceTokenTypes = useReferenceTokenType(type as TokenTypes);
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

  const filteredTokenItems = useMemo(
    () => {
      if (isDocumentationType(type as Properties)) {
        return resolvedTokens
          .filter(
            (token: SingleToken) => !filteredValue || token.name.toLowerCase().includes(filteredValue.toLowerCase()),
          )
          .filter((token: SingleToken) => token.name !== initialName).sort((a, b) => (
            a.name.localeCompare(b.name)
          ));
      }
      return resolvedTokens
        .filter(
          (token: SingleToken) => !filteredValue || token.name.toLowerCase().includes(filteredValue.toLowerCase()),
        )
        .filter((token: SingleToken) => referenceTokenTypes.includes(token?.type) && token.name !== initialName).sort((a, b) => (
          a.name.localeCompare(b.name)
        ));
    },
    [resolvedTokens, filteredValue, type, isDocumentationType],
  );

  const mentionData = useMemo<SuggestionDataItem[]>(() => {
    if (isDocumentationType(type as Properties)) {
      return resolvedTokens
        .filter((token: SingleToken) => token.name !== initialName).sort((a, b) => (
          a.name.localeCompare(b.name)
        )).map((resolvedToken) => ({
          id: resolvedToken.name,
          display: resolvedToken.name,
        }));
    }
    return resolvedTokens
      .filter((token: SingleToken) => referenceTokenTypes.includes(token?.type) && token.name !== initialName).sort((a, b) => (
        a.name.localeCompare(b.name)
      )).map((resolvedToken) => ({
        id: resolvedToken.name,
        display: resolvedToken.name,
      }));
  }, [initialName, resolvedTokens, referenceTokenTypes, type]);

  const resolveValue = useCallback((token: SingleToken) => {
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

  const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
  }, [handleChange]);

  const [mentionValue, setMentionValue] = React.useState('');

  const handleInputBlur = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (handleBlur) {
      handleBlur(e);
    }
  }, [handleBlur]);

  const handleMentionInputChange = React.useCallback((e, newValue) => {
    console.log('eee', e);
    setMentionValue(newValue);
  }, [handleChange]);

  const getContainer = React.useCallback((children: React.ReactNode) => {
    console.log('chic', children);
    return ReactDOM.createPortal(
      <Box css={{
        position: 'absolute', background: '$bgDefault', top: '0', width: `${inputContainerWith}px`, padding: '$2', zIndex: '10', transform: `translate(${inputContainerPosX}px, ${inputContainerPosY}px)`,
      }}
      >
        <StyledDropdown className="content scroll-container">
          {children}
        </StyledDropdown>
      </Box>,
      portalPlaceholder,
    );
  }, [inputContainerWith, inputContainerPosX, inputContainerPosY]);

  return (
    <Downshift onSelect={handleSelect}>
      {({
        selectedItem, highlightedIndex, getItemProps, getInputProps,
      }) => (
        <div className="relative">
          <Stack direction="row" justify="between" align="center" css={{ marginBottom: '$1' }}>
            {label && !inlineLabel ? <div className="font-medium text-xxs">{label}</div> : null}
            {error ? <div className="font-bold text-red-500">{error}</div> : null}
          </Stack>
          <Box css={{ display: 'flex', position: 'relative', width: '100%' }} className="input" ref={inputContainerRef}>
            {!!inlineLabel && !prefix && <Tooltip label={name}><StyledPrefix isText>{label}</StyledPrefix></Tooltip>}
            {!!prefix && <StyledPrefix>{prefix}</StyledPrefix>}
            {/* <StyledDownshiftInput
              suffix={suffix}
              type={type}
              name={name}
              placeholder={placeholder}
              value={value}
              onChange={handleInputChange}
              getInputProps={getInputProps}
              onBlur={handleInputBlur}
            /> */}
            <Input
              singleLine
              style={{ ...mentionInputStyles }}
              value={mentionValue}
              onChange={handleMentionInputChange}
              placeholder={placeholder}
              autoComplete="off"
              allowSpaceInQuery={false}
              customSuggestionsContainer={getContainer}
            >
              <Mention trigger="{" data={mentionData} markup=" __id__ " />
            </Input>

            {suffix && (
              <StyledInputSuffix type="button" data-testid="downshift-input-suffix-button" onClick={handleAutoSuggest}>
                <StyledIconDisclosure />
              </StyledInputSuffix>
            )}
          </Box>

          {filteredTokenItems
            && filteredTokenItems.length > 0
            && selectedItem?.name !== filteredValue
            && showAutoSuggest ? (
              ReactDOM.createPortal(
                <Box css={{
                  position: 'absolute', top: '0', width: `${inputContainerWith}px`, zIndex: '10', transform: `translate(${inputContainerPosX}px, ${inputContainerPosY}px)`,
                }}
                >
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
                        <StyledItemName>{getHighlightedText(token.name, filteredValue || '')}</StyledItemName>
                        <StyledItemValue>{resolveValue(token)}</StyledItemValue>
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

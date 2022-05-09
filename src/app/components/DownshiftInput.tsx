import React, { useCallback, useMemo } from 'react';
import Downshift from 'downshift';
import { styled } from '@/stitches.config';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';

import Box from './Box';
import Stack from './Stack';
import { SingleToken } from '@/types/tokens';
import { StyledInput, StyledPrefix } from './Input';

const StyledDropdown = styled('div', {
  position: 'absolute',
  zIndex: '10',
  width: '100%',
  maxHeight: '140px',
  borderRadius: '$contextMenu',
  overflowY: 'scroll',
  backgroundColor: 'white',
  marginTop: '1px',
  cursor: 'pointer',
  boxShadow: '$contextMenu',
});

const StyledItemValue = styled('div', {
  flexShrink: 0,
  color: '$textMuted',
  fontWeight: '$bold',
  textAlign: 'right',
  textTransform: 'uppercase',
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
  type: string;
  label?: string;
  error?: string;
  value: string;
  placeholder?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  resolvedTokens: ResolveTokenValuesResult[];
  setInputValue(value: string): void;
  showAutoSuggest: boolean;
  setShowAutoSuggest(show: boolean): void;
  handleChange?: React.ChangeEventHandler<HTMLInputElement>;
}

const DownshiftInput: React.FunctionComponent<DownShiftProps> = ({
  type,
  label,
  error,
  value,
  prefix,
  suffix,
  placeholder,
  setInputValue,
  resolvedTokens,
  showAutoSuggest,
  setShowAutoSuggest,
  handleChange,
}) => {
  const filteredValue = useMemo(() => (showAutoSuggest ? '' : value.replace(/[^a-zA-Z0-9.]/g, '')), [
    showAutoSuggest,
    value,
  ]); // removing non-alphanumberic except . from the input value

  const getHighlightedText = useCallback((text: string, highlight: string) => {
    // Split on highlight term and include term into parts, ignore case
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
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
    () => resolvedTokens
      .filter(
        (token: SingleToken) => !filteredValue || token.name.toLowerCase().includes(filteredValue.toLowerCase()),
      )
      .filter((token: SingleToken) => token?.type === type),
    [resolvedTokens, filteredValue, type],
  );

  const handleSelect = useCallback((selectedItem: any) => {
    setInputValue(value.includes('$') ? `$${selectedItem.name}` : `{${selectedItem.name}}`);
    setShowAutoSuggest(false);
  }, [setInputValue, setShowAutoSuggest, value]);

  return (
    <Downshift onSelect={handleSelect}>
      {({
        selectedItem, highlightedIndex, getItemProps, getInputProps,
      }) => (
        <div className="relative">
          <Stack direction="row" justify="between" align="center" css={{ marginBottom: '$1' }}>
            {label ? <div className="font-medium text-xxs">{label}</div> : null}
            {error ? <div className="font-bold text-red-500">{error}</div> : null}
          </Stack>
          <Box css={{ display: 'flex', position: 'relative', width: '100%' }} className="input">
            {!!prefix && <StyledPrefix>{prefix}</StyledPrefix>}
            <StyledInput
              {...getInputProps({
                label: type || null,
                name: 'value',
                placeholder,
                value: value || '',
                onChange: handleChange,
              })}
            />
            {!!suffix && suffix}
          </Box>

          {filteredTokenItems
          && filteredTokenItems.length > 0
          && selectedItem?.name !== filteredValue
          && (showAutoSuggest || (['{', '$'].some((c) => value.includes(c)) && !value.includes('}'))) ? (
            <StyledDropdown className="content scroll-container">
              {filteredTokenItems.map((token: SingleToken, index: number) => (
                <StyledItem
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
                  <StyledItemValue>{token.value}</StyledItemValue>
                </StyledItem>
              ))}
            </StyledDropdown>
            ) : null}
        </div>
      )}
    </Downshift>
  );
};

export default DownshiftInput;

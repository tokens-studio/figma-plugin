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
  maxHeight: '130px',
  borderRadius: '4px',
  overflowY: 'scroll',
  backgroundColor: 'white',
  marginTop: '4px',
  cursor: 'pointer',
  boxShadow: '0px 0px 20px 8px rgba(0, 0, 0, 0.42)',
});

const StyledItem = styled('div', {
  display: 'flex',
  alignItems: 'center',
  padding: '4px 10px',
  fontSize: '14px',
  ' &:focus': {
    backgroundColor: '$hover',
  },
});

const StyledItemColorDiv = styled('div', {
  width: '10%',
});

const StyledItemColor = styled('div', {
  width: '20px',
  height: '20px',
  borderRadius: '4px',
});

const StyledItemName = styled('div', {
  width: '70%',
  paddingLeft: '4px',
});

const StyledItemValue = styled('div', {
  width: '20%',
  color: '#959191',
  fontWeight: '500',
  paddingRight: '10px',
  textAlign: 'right',
  textTransform: 'uppercase',

  variants: {
    isFocused: {
      true: {
        color: 'black',
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
          <span key={i} style={part.toLowerCase() === highlight.toLowerCase() ? { fontWeight: 'bold' } : {}}>
            {part}
          </span>
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
    [resolvedTokens, filteredValue],
  );

  const handleSelect = useCallback((selectedItem: any, value) => {
    setInputValue(value.includes('$') ? `$${selectedItem.name}` : `{${selectedItem.name}}`);
    setShowAutoSuggest(false);
  }, []);

  return (
    <Downshift onSelect={(selectedItem) => handleSelect(selectedItem, value)}>
      {({
        selectedItem, highlightedIndex, getItemProps, getInputProps, getToggleButtonProps,
      }) => (
        <div className="relative">
          <Stack direction="row" justify="between" align="center" css={{ marginBottom: '$1' }}>
            {label ? <div className="text-xxs font-medium">{label}</div> : null}
            {error ? <div className="text-red-500 font-bold">{error}</div> : null}
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
            {!!suffix && <button {...getToggleButtonProps()}>{suffix}</button>}
          </Box>

          {filteredTokenItems
          && filteredTokenItems.length > 0
          && selectedItem?.name !== filteredValue
          && (showAutoSuggest || (['{', '$'].some((c) => value.includes(c)) && !value.includes('}'))) ? (
            <StyledDropdown>
              {filteredTokenItems.map((token: SingleToken, index: number) => (
                <StyledItem
                  className="dropdown-item"
                  {...getItemProps({ key: token.name, index, item: token })}
                  css={{
                    backgroundColor: highlightedIndex === index ? '$hover' : '$bgDefault',
                  }}
                >
                  {type === 'color' && (
                    <StyledItemColorDiv>
                      <StyledItemColor style={{ backgroundColor: token.value }} />
                    </StyledItemColorDiv>
                  )}
                  <StyledItemName>{getHighlightedText(token.name, filteredValue || '')}</StyledItemName>
                  <StyledItemValue isFocused={highlightedIndex === index}>{token.value}</StyledItemValue>
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

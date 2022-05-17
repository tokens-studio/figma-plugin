import React, { useCallback, useMemo } from 'react';
import Downshift from 'downshift';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import Box from '../Box';
import Stack from '../Stack';
import { SingleToken } from '@/types/tokens';
import { StyledPrefix } from '../Input';
import { StyledItemColorDiv } from './StyledItemColorDiv';
import { StyledItemColor } from './StyledItemColor';
import { StyledItemName } from './StyledItemName';
import { StyledItemValue } from './StyledItemValue';
import { StyledDropdown } from './StyledDropdown';
import { StyledItem } from './StyledItem';
import { StyledPart } from './StyledPart';
import { StyledDownshiftInput } from './StyledDownshiftInput';

interface DownShiftProps {
  type: string;
  label?: string;
  error?: string;
  value?: string;
  placeholder?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  resolvedTokens: ResolveTokenValuesResult[];
  setInputValue(value: string): void;
  showAutoSuggest: boolean;
  setShowAutoSuggest(show: boolean): void;
  handleChange?: React.ChangeEventHandler<HTMLInputElement>;
}

export const DownshiftInput: React.FC<DownShiftProps> = ({
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
  const filteredValue = useMemo(() => ((showAutoSuggest || !value) ? '' : value.replace(/[^a-zA-Z0-9.]/g, '')), [
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
    setInputValue(value?.includes('$') ? `$${selectedItem.name}` : `{${selectedItem.name}}`);
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
            <StyledDownshiftInput
              suffix={suffix}
              type={type}
              placeholder={placeholder}
              value={value}
              onChange={handleChange}
              getInputProps={getInputProps}
            />
            {!!suffix && suffix}
          </Box>

          {filteredTokenItems
          && filteredTokenItems.length > 0
          && selectedItem?.name !== filteredValue
          && (showAutoSuggest || (['{', '$'].some((c) => value?.includes(c)) && !value?.includes('}'))) ? (
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

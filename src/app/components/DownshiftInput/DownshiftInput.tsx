import React, { useCallback, useMemo } from 'react';
import Downshift from 'downshift';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import Box from '../Box';
import { StyledIconDisclosure, StyledInputSuffix } from '../StyledInputSuffix';
import Stack from '../Stack';
import { SingleToken } from '@/types/tokens';
import { StyledPrefix } from '../Input';
import { TokenTypes } from '@/constants/TokenTypes';
import { styled } from '@/stitches.config';
import { StyledDownshiftInput } from './StyledDownshiftInput';

const StyledDropdown = styled('div', {
  position: 'absolute',
  zIndex: '10',
  width: '100%',
  maxHeight: '140px',
  borderRadius: '$contextMenu',
  overflowY: 'scroll',
  backgroundColor: '$bgDefault',
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
  name?: string;
  type: string;
  label?: string;
  error?: string;
  value?: string;
  placeholder?: string;
  prefix?: React.ReactNode;
  suffix?: boolean;
  resolvedTokens: ResolveTokenValuesResult[];
  setInputValue(value: string): void;
  handleChange?: React.ChangeEventHandler<HTMLInputElement>;
}

export const DownshiftInput: React.FunctionComponent<DownShiftProps> = ({
  name,
  type,
  label,
  error,
  value,
  prefix,
  suffix,
  placeholder,
  setInputValue,
  resolvedTokens,
  handleChange,
}) => {
  const [showAutoSuggest, setShowAutoSuggest] = React.useState<boolean>(false);

  const filteredValue = useMemo(() => (showAutoSuggest ? '' : value?.replace(/[^a-zA-Z0-9.]/g, '')), [
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
    } else if (typeof token.value === 'string') {
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
              name={name}
              placeholder={placeholder}
              value={value}
              onChange={handleChange}
              getInputProps={getInputProps}
            />
            {suffix && (
              <StyledInputSuffix type="button" onClick={handleAutoSuggest}>
                <StyledIconDisclosure />
              </StyledInputSuffix>
            )}
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
                    <StyledItemValue>{resolveValue(token)}</StyledItemValue>
                  </StyledItem>
                ))}
              </StyledDropdown>
            ) : null}
        </div>
      )}
    </Downshift>
  );
};

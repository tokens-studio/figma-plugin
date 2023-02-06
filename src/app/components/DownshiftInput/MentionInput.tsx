import React, { useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Mention, MentionsInput, SuggestionDataItem } from 'react-mentions';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import Box from '../Box';
import { SingleToken } from '@/types/tokens';
import { TokenTypes } from '@/constants/TokenTypes';
import { Properties } from '@/constants/Properties';
import { isDocumentationType } from '@/utils/is/isDocumentationType';
import { useReferenceTokenType } from '@/app/hooks/useReferenceTokenType';
import {
  StyledDropdown, StyledItem, StyledItemColor, StyledItemColorDiv, StyledItemName, StyledItemValue, StyledPart,
} from './StyledDownshiftInput';

interface MentionInputProps {
  name?: string;
  type: string;
  value?: string;
  initialName?: string;
  placeholder?: string;
  resolvedTokens: ResolveTokenValuesResult[];
  portalPlaceholder: HTMLDivElement
  inputContainerWith: number,
  inputContainerPosX: number,
  inputContainerPosY: number,
  handleChange: React.ChangeEventHandler<HTMLInputElement>;
  handleBlur?: () => void;
  handleOnFocus: React.FocusEventHandler<HTMLTextAreaElement>
}

const mentionInputStyles = {
  width: '100%',
  input: {
    width: '100%',
    height: '28px',
    padding: '0 var(--space-3)',
    backgroundColor: 'var(--colors-bgDefault)',
    border: '1px solid var(--colors-borderMuted)',
    borderRadius: 'var(--radii-input)',
    fontSize: 'var(--fontSizes-small)',
    '&:focus-within': {
      boxShadow: 'var(--shadows-focus)',
    },
  },
  suggestions: {
    borderRadius: 'var(--radii-contextMenu)',
    boxShadow: 'var(--shadows-contextMenu)',
    background: 'var(--colors-bgDefault)',
    list: {
      top: 'var(--space-3)',
      fontSize: 'var(--fontSizes-small)',
      borderRadius: 'var(--radii-contextMenu)',
      cursor: 'pointer',
      zIndex: '10',
    },
    item: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      padding: 'var(--space-2) var(--space-3)',
      color: 'var(--colors-fgDefault)',
      fontSize: 'var(--fontSizes-xsmall)',
      '&focused': {
        background: 'var(--colors-interaction)',
      },
    },
  },
};

export const MentionInput: React.FunctionComponent<MentionInputProps> = ({
  name = 'value',
  type,
  value,
  initialName,
  placeholder,
  resolvedTokens,
  portalPlaceholder,
  inputContainerWith,
  inputContainerPosX,
  inputContainerPosY,
  handleChange,
  handleBlur,
  handleOnFocus,
}) => {
  const referenceTokenTypes = useReferenceTokenType(type as TokenTypes);

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

  const handleInputBlur = React.useCallback(() => {
    if (handleBlur) {
      handleBlur();
    }
  }, [handleBlur]);

  const handleMentionInputChange = React.useCallback((e) => {
    e.target.name = name ?? 'value';
    handleChange(e);
  }, [handleChange, name]);

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
    index,
    focused,
  ) => {
    const resolvedToken = resolvedTokens.find((token) => token.type === type && token.name === suggestion.id);
    return (
      <StyledItem
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
      onFocus={handleOnFocus}
    >
      <Mention
        trigger="{"
        data={mentionData}
        markup="{__id__}"
        renderSuggestion={renderMentionListItem}
        displayTransform={renderDisplayTransform}
      />
    </MentionsInput>

  );
};

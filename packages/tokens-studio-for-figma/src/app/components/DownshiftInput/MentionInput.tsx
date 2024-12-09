import React, { useMemo } from 'react';
import Mentions from 'rc-mentions';
import {
  Stack,
  Tooltip,
} from '@tokens-studio/ui';
import { SingleToken } from '@/types/tokens';
import { useReferenceTokenType } from '@/app/hooks/useReferenceTokenType';

// Styles
import {
  StyledItem, StyledItemColor, StyledItemColorDiv, StyledItemName, StyledItemValue, StyledPart,
} from './StyledDownshiftInput';
import './mentions.css';

// Utils
import { ResolveTokenValuesResult } from '@/utils/tokenHelpers';
import { isDocumentationType } from '@/utils/is/isDocumentationType';
import getResolvedTextValue from '@/utils/getResolvedTextValue';
import { getColorSwatchStyle } from '@/utils/color/getColorSwatchStyle';

// Constants
import { Properties } from '@/constants/Properties';
import { TokenTypes } from '@/constants/TokenTypes';

export interface SuggestionDataItem {
  id: string;
  display: string;
}

interface Props {
  autoFocus?: boolean;
  name?: string;
  type: string;
  value?: string;
  initialName?: string;
  placeholder?: string;
  resolvedTokens: ResolveTokenValuesResult[];
  handleChange: (property: string, value: string) => void;
  handleBlur?: () => void;
  handleOnFocus?: React.FocusEventHandler<HTMLTextAreaElement>;
  onSubmit?: () => void;
  hasPrefix?: boolean;
}

const { Option } = Mentions;

export default function MentionsInput({
  autoFocus = false,
  name = 'value',
  type,
  value,
  initialName,
  placeholder,
  resolvedTokens,
  handleChange,
  handleBlur,
  handleOnFocus,
  onSubmit,
  hasPrefix = false,
}: Props) {
  const referenceTokenTypes = useReferenceTokenType(type as TokenTypes);

  const mentionData = useMemo<SuggestionDataItem[]>(() => {
    if (isDocumentationType(type as Properties)) {
      return resolvedTokens
        .filter((token: SingleToken) => token.name !== initialName).sort((a, b) => (
          a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
        )).map((resolvedToken) => ({
          id: `${resolvedToken.name}}`,
          display: resolvedToken.name,
        }));
    }
    return resolvedTokens
      .filter((token: SingleToken) => referenceTokenTypes.includes(token?.type) && token.name !== initialName).sort((a, b) => (
        a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
      )).map((resolvedToken) => ({
        id: `${resolvedToken.name}}`,
        display: resolvedToken.name,
      }));
  }, [initialName, resolvedTokens, referenceTokenTypes, type]);

  const handleMentionInputChange = React.useCallback((newValue: string) => {
    handleChange(name, newValue.replace(/}(?=\s)[^{}]*}/gi, '}'));
  }, [handleChange, name]);

  const handleInputBlur = React.useCallback(() => {
    if (handleBlur) {
      handleBlur();
    }
  }, [handleBlur]);

  const getHighlightedText = React.useCallback((text: string, highlight: string) => {
    // Note that the highlight might be numeric, hence we cast it to a string
    // Split on highlight term and include term into parts, ignore case
    const parts = text.split(new RegExp(`(${String(highlight).replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <StyledPart key={i} matches={part.toLowerCase() === String(highlight).toLowerCase()}>
            {part}
          </StyledPart>
        ))}
        {' '}
      </span>
    );
  }, []);

  const renderMentionListItem = React.useCallback((
    suggestion: SuggestionDataItem,
  ) => {
    const resolvedToken = resolvedTokens.find((token) => referenceTokenTypes.includes(token?.type) && token.name === suggestion.display);
    return (
      <Option
        key={(suggestion.id as string) || 'not-found'}
        value={suggestion.id as string}
        className="mentions-item"
      >
        <Tooltip
          side="bottom"
          label={(
            <Stack direction="column" align="start" gap={1} css={{ wordBreak: 'break-word' }}>
              <StyledItemName css={{ color: '$tooltipFg' }}>
                {getHighlightedText(resolvedToken?.name ?? '', value || '')}
              </StyledItemName>
              {resolvedToken && (
                <StyledItemValue css={{ color: '$tooltipFgMuted' }}>
                  <span>
                    {getResolvedTextValue(resolvedToken)}
                  </span>
                </StyledItemValue>
              )}
            </Stack>
          )}
        >
          <StyledItem className="dropdown-item">
            {type === 'color' && <StyledItemColorDiv><StyledItemColor style={resolvedToken?.value ? getColorSwatchStyle(resolvedToken?.value.toString()) : {}} /></StyledItemColorDiv>}
            <StyledItemName truncate>{getHighlightedText(resolvedToken?.name ?? '', value || '')}</StyledItemName>
            {resolvedToken && <StyledItemValue truncate>{getResolvedTextValue(resolvedToken)}</StyledItemValue>}
          </StyledItem>
        </Tooltip>
      </Option>
    );
  }, [resolvedTokens, type, getHighlightedText, referenceTokenTypes, value]);

  const handleEnterKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    onSubmit?.();
  }, [onSubmit]);

  return (
    <Mentions
      autoSize
      name={name}
      value={value}
      placeholder={placeholder}
      prefix={['{']}
      placement="bottom"
      autoFocus={autoFocus}
      onChange={handleMentionInputChange}
      onBlur={handleInputBlur}
      onFocus={handleOnFocus}
      onPressEnter={handleEnterKeyDown}
      data-testid={`mention-input-${name}`}
      className={hasPrefix ? '' : 'mentions-no-prefix'}
    >
      {mentionData.map((item) => (
        renderMentionListItem(item)
      ))}
    </Mentions>
  );
}

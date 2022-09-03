import React, { useContext, useMemo } from 'react';

import { useSelector } from 'react-redux';
import { lightOrDark } from '@/utils/color';
import { TokensContext } from '@/context';
import { getAliasValue } from '@/utils/alias';
import { styled } from '@/stitches.config';
import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken } from '@/types/tokens';
import { TokenTooltip } from '../TokenTooltip';
import BrokenReferenceIndicator from '../BrokenReferenceIndicator';
import { displayTypeSelector, uiDisabledSelector } from '@/selectors';

type Props = {
  active: boolean;
  type: TokenTypes;
  token: SingleToken;
  onClick: () => void;
};

const StyledTokenButton = styled('button', {
  position: 'relative',
  marginBottom: '$1',
  marginRight: '$1',
  variants: {
    active: {
      true: {
        backgroundColor: '$bgAccent',
        boxShadow: '$focus-muted',
      },
    },
    disabled: {
      true: {
        borderColor: '$border',
      },
    },
  },
});

export default function TokenButtonContent({
  token, active, type, onClick,
}: Props) {
  const tokensContext = useContext(TokensContext);
  const uiDisabled = useSelector(uiDisabledSelector);
  const displayType = useSelector(displayTypeSelector);

  const displayValue = useMemo(() => (
    getAliasValue(token, tokensContext.resolvedTokens)
  ), [token, tokensContext.resolvedTokens]);

  const showValue = React.useMemo(() => {
    let show = true;
    if (type === TokenTypes.COLOR) {
      show = false;
      if (displayType === 'LIST') {
        show = true;
      }
    }
    return show;
  }, [type, displayType]);

  // Only show the last part of a token in a group
  const visibleName = React.useMemo(() => {
    const visibleDepth = 1;
    return (token.name ?? '').split('.').slice(-visibleDepth).join('.');
  }, [token.name]);

  const cssOverrides = React.useMemo(() => {
    if (type === TokenTypes.BORDER_RADIUS) {
      return {
        borderRadius: `${displayValue}px`,
      };
    }

    if (type === TokenTypes.COLOR) {
      const colorListOverride = (displayType === 'LIST') ? {
        borderRadius: '$button',
        width: '100%',
        padding: '$1',
        marginBottom: '-$1',
      } : {};

      return {
        '--backgroundColor': String(displayValue),
        '--borderColor': lightOrDark(String(displayValue)) === 'light' ? '$border' : '$borderMuted',
        borderRadius: '100px',
        backgroundColor: 'transparent',
        '&:focus': {
          outline: 'none',
          boxShadow: '0 0 0 2px $borderMuted',
        },
        '.button-text::before': {
          width: '16px',
          height: '16px',
          margin: '0 auto',
          flexShrink: 0,
          border: '1px solid white',
          content: '',
          borderRadius: '100%',
          background: 'var(--backgroundColor)',
          borderColor: 'var(--borderColor)',
        },
        ...colorListOverride,
      };
    }
    return {};
  }, [type, displayValue, displayType]);

  return (
    <TokenTooltip token={token}>
      <StyledTokenButton active={active} disabled={uiDisabled} type="button" onClick={onClick} css={cssOverrides}>
        <BrokenReferenceIndicator token={token} />
        <div className="button-text">{showValue && <span>{visibleName}</span>}</div>
      </StyledTokenButton>
    </TokenTooltip>
  );
}

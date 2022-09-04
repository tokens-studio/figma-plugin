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

const StyledTokenButtonText = styled('span', {
  color: '$fgDefault',
  padding: '$2 $3',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  flexShrink: 0,
  textAlign: 'left',
  gap: '$2',
});

const StyledTokenButton = styled('button', {
  position: 'relative',
  marginBottom: '$1',
  marginRight: '$1',
  backgroundColor: '$bgSubtle',
  '&:hover, &:focus': {
    backgroundColor: '$bgAccent',
  },
  compoundVariants: [
    {
      displayType: 'LIST',
      tokenType: TokenTypes.COLOR,
      css: {
        borderRadius: '$tokenButton',
        width: '100%',
        padding: '$1',
      },
    },
    {
      displayType: 'GRID',
      tokenType: TokenTypes.COLOR,
      css: {
        [`& ${StyledTokenButtonText}`]: {
          padding: 0,
        },
      },
    },
  ],
  variants: {
    tokenType: {
      [TokenTypes.COLOR]: {
        borderRadius: '$full',
        backgroundColor: 'transparent',
        '&:focus': {
          outline: 'none',
          boxShadow: '$tokenFocus',
        },
        [`& ${StyledTokenButtonText}::before`]: {
          width: '$6',
          height: '$6',
          flexShrink: 0,
          border: '1px solid',
          content: '',
          borderRadius: '$full',
          background: 'var(--backgroundColor)',
          borderColor: 'var(--borderColor)',
        },
      },
    },
    displayType: {
      LIST: {
        width: '100%',
        [`& ${StyledTokenButtonText}`]: {
          borderRadius: '$button',
          justifyContent: 'flex-start',
        },
      },
      GRID: {
        borderRadius: '$tokenButton',
        [`& ${StyledTokenButtonText}`]: {
          borderRadius: '$full',
        },
      },
    },
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
    switch (type) {
      case TokenTypes.COLOR: {
        return {
          '--backgroundColor': String(displayValue),
          '--borderColor': lightOrDark(String(displayValue)) === 'light' ? '$colors$border' : '$colors$borderMuted',
        };
      }
      case TokenTypes.BORDER_RADIUS: {
        return {
          borderRadius: `${displayValue}px`,
        };
      }
      default: {
        return {};
      }
    }
  }, [type, displayValue]);

  return (
    <TokenTooltip token={token}>
      <StyledTokenButton tokenType={type as TokenTypes.COLOR} displayType={displayType} active={active} disabled={uiDisabled} type="button" onClick={onClick} css={cssOverrides}>
        <BrokenReferenceIndicator token={token} />
        <StyledTokenButtonText>{showValue && <span>{visibleName}</span>}</StyledTokenButtonText>
      </StyledTokenButton>
    </TokenTooltip>
  );
}

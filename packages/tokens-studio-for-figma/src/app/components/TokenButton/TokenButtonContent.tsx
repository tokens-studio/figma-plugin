import React, { useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { TokensContext } from '@/context';
import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken } from '@/types/tokens';
import { TokenTooltip } from '../TokenTooltip';
import BrokenReferenceIndicator from '../BrokenReferenceIndicator';
import { displayTypeSelector, uiDisabledSelector } from '@/selectors';
import { StyledTokenButton, StyledTokenButtonText } from './StyledTokenButton';
import useTokens from '@/app/store/useTokens';
import { gradientTokenToCss, isGradientTokenValue } from '@/utils/color';
import { TokenGradientValue } from '@/types/values';
import { getAliasValue } from '@/utils/alias';

type Props = {
  active: boolean;
  type: TokenTypes;
  token: SingleToken;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

export default function TokenButtonContent({
  token, active, type, onClick,
}: Props) {
  const tokensContext = useContext(TokensContext);
  const uiDisabled = useSelector(uiDisabledSelector);
  const displayType = useSelector(displayTypeSelector);
  const { getTokenValue } = useTokens();

  const displayValue = useMemo(() => (
    getTokenValue(token.name, tokensContext.resolvedTokens)?.value
  ), [token, tokensContext.resolvedTokens, getTokenValue]);

  const showValue = React.useMemo(() => {
    let show = true;
    if (type === TokenTypes.COLOR || type === TokenTypes.GRADIENT) {
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

  const handleButtonClick = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onClick(event);
  }, [onClick]);

  const cssOverrides = React.useMemo(() => {
    switch (type) {
      case TokenTypes.COLOR: {
        return {
          '--backgroundColor': String(displayValue),
          '--borderColor': '$colors$borderMuted',
        };
      }
      case TokenTypes.GRADIENT: {
        let gradVal: TokenGradientValue | null = null;
        if (isGradientTokenValue(displayValue)) {
          gradVal = displayValue;
        } else if (isGradientTokenValue(token.value)) {
          gradVal = token.value;
        }
        let bg = 'transparent';
        if (gradVal) {
          // Resolve any stop colors that are token references (e.g. {color.brand}) so
          // the swatch renders correctly when displayValue was corrupted by server merge.
          const resolvedStops = gradVal.stops.map((stop) => {
            if (typeof stop.color === 'string' && stop.color.startsWith('{')) {
              const resolved = getAliasValue(stop.color, tokensContext.resolvedTokens as SingleToken[]);
              return { ...stop, color: typeof resolved === 'string' ? resolved : stop.color };
            }
            return stop;
          });
          bg = gradientTokenToCss({ ...gradVal, stops: resolvedStops });
        } else if (typeof displayValue === 'string') {
          bg = displayValue;
        }
        return {
          '--backgroundColor': bg,
          '--borderColor': '$colors$borderMuted',
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
  }, [type, displayValue, token.value, tokensContext.resolvedTokens]);

  return (
    <TokenTooltip token={token}>
      <StyledTokenButton tokenType={type as TokenTypes.COLOR} displayType={type === TokenTypes.COLOR || type === TokenTypes.GRADIENT ? displayType : 'GRID'} active={active} disabled={uiDisabled} deprecated={!!token.$deprecated} type="button" onClick={handleButtonClick} css={cssOverrides}>
        <BrokenReferenceIndicator token={token} />
        <StyledTokenButtonText>{showValue && <span>{visibleName}</span>}</StyledTokenButtonText>
      </StyledTokenButton>
    </TokenTooltip>
  );
}

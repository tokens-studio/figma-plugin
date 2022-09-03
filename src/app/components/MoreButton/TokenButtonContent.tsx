import React, { useContext, useMemo } from 'react';

import { useSelector } from 'react-redux';
import { lightOrDark } from '@/utils/color';
import { TokensContext } from '@/context';
import { getAliasValue } from '@/utils/alias';
import { theme } from '@/stitches.config';
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

  const [style, buttonClass] = React.useMemo(() => {
    const innerStyle: React.CSSProperties = {};
    const innerClass: string[] = [];

    if (type === TokenTypes.BORDER_RADIUS) {
      innerStyle.borderRadius = `${displayValue}px`;
    } else if (type === TokenTypes.COLOR) {
      innerStyle['--backgroundColor'] = String(displayValue);
      innerStyle['--borderColor'] = lightOrDark(String(displayValue)) === 'light' ? String(theme.colors.border) : String(theme.colors.borderMuted);

      innerClass.push('button-property-color');
      if (displayType === 'LIST') {
        innerClass.push('button-property-color-listing');
      }
    }

    if (active) {
      innerClass.push('button-active');
    }

    return [innerStyle, innerClass] as [typeof innerStyle, typeof innerClass];
  }, [type, active, displayValue, displayType]);
  return (
    <div
      className={`relative mb-1 mr-1 button button-property ${buttonClass.join(' ')} ${
        uiDisabled && 'button-disabled'
      } `}
      style={style}
    >
      <TokenTooltip token={token}>
        <button
          className="w-full h-full relative"
          type="button"
          onClick={onClick}
        >
          <BrokenReferenceIndicator token={token} />
          <div className="button-text">{showValue && <span>{visibleName}</span>}</div>
        </button>
      </TokenTooltip>
    </div>
  );
}

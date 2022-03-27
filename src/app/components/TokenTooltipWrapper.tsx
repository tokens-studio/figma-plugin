import React from 'react';
import { SingleToken } from '@/types/tokens';
import useTokens from '../store/useTokens';
import TokenTooltip from './TokenTooltip';
import Tooltip from './Tooltip';

export default function TokenTooltipWrapper({
  children,
  token,
  resolvedTokens,
}: {
  token: SingleToken;
  resolvedTokens: SingleToken[];
  children: React.ReactNode;
}) {
  const { isAlias } = useTokens();

  return (
    <Tooltip
      side="bottom"
      label={(
        <div>
          <div className="text-xs font-bold text-gray-500">
            {token.name.split('.')[token.name.split('.').length - 1]}
          </div>
          <TokenTooltip token={token} resolvedTokens={resolvedTokens} />
          {isAlias(token, resolvedTokens) && (
            <div className="text-gray-400">
              <TokenTooltip token={token} resolvedTokens={resolvedTokens} shouldResolve />
            </div>
          )}
          {token.description && <div className="text-gray-500">{token.description}</div>}
        </div>
      )}
    >
      {children}
    </Tooltip>
  );
}

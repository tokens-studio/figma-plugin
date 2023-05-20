import React from 'react';
import { DeepKeyTokenMap } from '@/types/tokens';
import ToggleEmptyButton from './ToggleEmptyButton';
import TokenListing from './TokenListing';
import { TokenTypes } from '@/constants/TokenTypes';

type Props = {
  tokens: Array<{
    type: TokenTypes
    values: DeepKeyTokenMap
  }>
};

export default function TokenByTypeView({ tokens }: Props) {
  return (
    <div>
      {tokens.map(({
        values, type,
      }) => (
        <div key={type}>
          <TokenListing
            type={type}
            values={values}
          />
        </div>
      ))}
      <ToggleEmptyButton />
    </div>
  );
}

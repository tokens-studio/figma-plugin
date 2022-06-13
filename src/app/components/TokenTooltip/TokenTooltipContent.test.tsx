import React from 'react';

import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken } from '@/types/tokens';
import { render } from '../../../../tests/config/setupTest';
import { TokenTooltipContent } from './TokenTooltipContent';

describe('tokenTooltipContent test', () => {
  it('if token contains no alias', () => {
    const input: SingleToken = {
      name: 'testToken',
      type: TokenTypes.COLOR,
      value: '#00ff00',
    };
    const { getByText } = render(<TokenTooltipContent token={input} />);
    expect(getByText(input.value)).toBeInTheDocument();
  });

  it('if token contains alias', () => {
    const input: SingleToken = {
      name: 'testToken',
      type: TokenTypes.COLOR,
      value: '{color.foo}',
      rawValue: '#00ff33',
    };
    const { getByText } = render(<TokenTooltipContent token={input} />);
    expect(getByText(input.rawValue ?? '')).toBeInTheDocument();
  });
});

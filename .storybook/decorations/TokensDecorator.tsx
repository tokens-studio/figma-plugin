import { TokensContext, TokensContextValue } from '../../src/context/TokensContext';
import { TokenTypes } from '@/constants/TokenTypes';
import { useParameter } from '@storybook/addons';
import { useState } from 'react';

export default function TokensDecorator(Story, context) {
  const initialState = useParameter('tokens', {
    resolvedTokens: [
      {
        name: 'theme.bg.default',
        value: '#ff0000',
        description: 'My default token',
        type: TokenTypes.COLOR,
      },
      {
        name: 'colors.red.500',
        value: '#ff0000',
        type: TokenTypes.COLOR,
      },
      {
        name: 'typography.headlines.small',
        value: {
          fontFamily: 'Inter',
          fontWeight: 'Regular',
          lineHeight: 'AUTO',
          fontSize: '14',
          letterSpacing: '0%',
          paragraphSpacing: '0',
          textDecoration: 'none',
          textCase: 'none',
        },
        type: TokenTypes.TYPOGRAPHY,
      }
    ],
  });

  const [state, setState] = useState({ ...initialState });

  return (
    <div>
    <TokensContext.Provider value={state}>
      <Story />
    </TokensContext.Provider>
    </div>
  );
}

import React from "react"
import { TokensContext, TokensContextValue } from '../../src/context/TokensContext';
import { TokenTypes } from '@/constants/TokenTypes';
import { BoxShadowTypes } from '@/constants/BoxShadowTypes';
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
      },
      {
        name: 'card.default',
        value: {
          fill: '#ff0000',
          border: '#cccccc',
          borderWidth: '1px',
          borderRadius: '6px',
          boxShadow: {
            x: '2',
            y: '2',
            blur: '2',
            spread: '2',
            color: '#000000',
            type: BoxShadowTypes.DROP_SHADOW,
          },
          opacity: '10%',
          itemSpacing: '16px',
        },
        type: TokenTypes.COMPOSITION,
      },
      {
        name: 'size.broken',
        value: '{size.notfound}',
        type: TokenTypes.SIZING,
        failedToResolve: true
      },
      {
        name: 'color.broken',
        value: '{color.notfound}',
        type: TokenTypes.COLOR,
        failedToResolve: true
      },
      {
        name: 'shadows.broken',
        value: {
          x: '2',
          y: '2',
          blur: '2',
          spread: '2',
          color: '{colors.red.500}',
          type: BoxShadowTypes.DROP_SHADOW,
        },
        description: 'My default token',
        type: TokenTypes.BOX_SHADOW,
        failedToResolve: true
      },
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

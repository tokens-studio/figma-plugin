import { TokenTypes } from '@/constants/TokenTypes';
import { AnyTokenList } from '@/types/tokens';
import React from 'react';
import { Provider } from 'react-redux';
import {
  render, fireEvent, resetStore, createMockStore,
} from '../../../../tests/config/setupTest';
import SingleFileExport from './SingleFileExport';

describe('SingleFileExport', () => {
  const mockClose = jest.fn();
  const defaultStore = {
    tokenState: {
      themes: [{
        id: 'light', name: 'Light', selectedTokenSets: {}, $figmaStyleReferences: {},
      }],
      tokens: {
        global: [
          { name: 'white', value: '#ffffff', type: TokenTypes.COLOR }, 
          { name: 'headline', value: { fontFamily: 'Inter', fontWeight: 'Bold' }, type: TokenTypes.TYPOGRAPHY }, 
          { name: 'shadow', value: {blur: '2', color: '#000000', spread: '0', type: 'innerShadow', x: '2', y: '2' }, type: TokenTypes.BOX_SHADOW }, 
          { name: 'composition', value: { fill: '$white' }, type: TokenTypes.COMPOSITION }
        ],
        light: [
          { name: 'bg.default', value: '#ffffff', type: TokenTypes.COLOR }
        ],
      } as Record<string, AnyTokenList>,
    },
  };

  it('should return tokens with parent key', () => {
    const mockStore = createMockStore(defaultStore);
    const result = render(
      <Provider store={mockStore}>
        <SingleFileExport onClose={mockClose} />
      </Provider>,
    );
    const incluedeAllTokensCheckBox = result.getByTestId('includeAllTokens');
    const includeParentCheckBox = result.getByTestId('includeParent');
    const expandTypographyCheckBox = result.getByTestId('expandTypography');
    const expandShadowCheckBox = result.getByTestId('expandShadow');
    const expandCompositionCheckBox = result.getByTestId('expandComposition');
    const textArea = result.getByRole('textbox');
    expect(textArea).toHaveValue(
      JSON.stringify({
        global: {
          white: {
            value: '#ffffff',
            type: 'color'
          },
          headline: {
            value: {
              fontFamily: 'Inter',
              fontWeight: 'Bold'
            },
            type: 'typography'
          },
          shadow: {
            value: {
              blur: '2',
              color: '#000000',
              spread: '0',
              type: 'innerShadow',
              x: '2',
              y: '2'
            },
            type: 'boxShadow'
          },
          composition: {
            value: {
              fill: '$white',
            },
            type: 'composition'
          },
        }
      }, null, 2)
    )
  });
  
});
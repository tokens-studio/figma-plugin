import React from 'react';
import { Provider } from 'react-redux';
import { TokenTypes } from '@/constants/TokenTypes';
import { AnyTokenList } from '@/types/tokens';
import {
  render, fireEvent, createMockStore,
} from '../../../../tests/config/setupTest';
import SingleFileExport from './SingleFileExport';

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
        {
          name: 'shadow',
          value: {
            blur: '2', color: '#000000', spread: '0', type: 'innerShadow', x: '2', y: '2',
          },
          type: TokenTypes.BOX_SHADOW,
        },
        { name: 'composition', value: { fill: '$white' }, type: TokenTypes.COMPOSITION },
        { name: 'border', value: { color: '$white', width: '5px' }, type: TokenTypes.BORDER },
      ],
      light: [
        { name: 'bg.default', value: '#ffffff', type: TokenTypes.COLOR },
      ],
    } as Record<string, AnyTokenList>,
  },
};

describe('SingleFileExport', () => {
  it('should return tokens with parent key', () => {
    const mockStore = createMockStore(defaultStore);
    const result = render(
      <Provider store={mockStore}>
        <SingleFileExport onClose={mockClose} />
      </Provider>,
    );
    const textArea = result.getByRole('textbox');
    expect(textArea).toHaveValue(
      JSON.stringify({
        global: {
          white: {
            value: '#ffffff',
            type: 'color',
          },
          headline: {
            value: {
              fontFamily: 'Inter',
              fontWeight: 'Bold',
            },
            type: 'typography',
          },
          shadow: {
            value: {
              blur: '2',
              color: '#000000',
              spread: '0',
              type: 'innerShadow',
              x: '2',
              y: '2',
            },
            type: 'boxShadow',
          },
          composition: {
            value: {
              fill: '$white',
            },
            type: 'composition',
          },
          border: {
            value: {
              color: '$white',
              width: '5px',
            },
            type: 'border',
          },
        },
      }, null, 2),
    );
  });

  it('should return all token sets, themes, metadata', () => {
    const mockStore = createMockStore(defaultStore);
    const result = render(
      <Provider store={mockStore}>
        <SingleFileExport onClose={mockClose} />
      </Provider>,
    );
    const incluedeAllTokensCheckBox = result.getByTestId('includeAllTokens');
    fireEvent.click(incluedeAllTokensCheckBox);
    const textArea = result.getByRole('textbox');
    expect(textArea).toHaveValue(
      JSON.stringify({
        global: {
          white: {
            value: '#ffffff',
            type: 'color',
          },
          headline: {
            value: {
              fontFamily: 'Inter',
              fontWeight: 'Bold',
            },
            type: 'typography',
          },
          shadow: {
            value: {
              blur: '2',
              color: '#000000',
              spread: '0',
              type: 'innerShadow',
              x: '2',
              y: '2',
            },
            type: 'boxShadow',
          },
          composition: {
            value: {
              fill: '$white',
            },
            type: 'composition',
          },
          border: {
            value: {
              color: '$white',
              width: '5px',
            },
            type: 'border',
          },
        },
        light: {
          bg: {
            default: {
              value: '#ffffff',
              type: 'color',
            },
          },
        },
        $themes: [
          {
            id: 'light',
            name: 'Light',
            selectedTokenSets: {},
            $figmaStyleReferences: {},
          },
        ],
        $metadata: {
          tokenSetOrder: [
            'global',
            'light',
          ],
        },
      }, null, 2),
    );
  });

  it('should return expanded typography token', () => {
    const mockStore = createMockStore({
      tokenState: {
        tokens: {
          global: [
            { name: 'headline', value: { fontFamily: 'Inter', fontWeight: 'Bold' }, type: TokenTypes.TYPOGRAPHY },
            { name: 'alias', value: '$headline', type: TokenTypes.TYPOGRAPHY },
          ],
        },
      },
    });
    const result = render(
      <Provider store={mockStore}>
        <SingleFileExport onClose={mockClose} />
      </Provider>,
    );
    const expandTypographyCheckBox = result.getByTestId('expandTypography');
    fireEvent.click(expandTypographyCheckBox);
    const textArea = result.getByRole('textbox');
    expect(textArea).toHaveValue(
      JSON.stringify({
        global: {
          headline: {
            fontFamily: {
              value: 'Inter',
              type: 'fontFamilies',
            },
            fontWeight: {
              value: 'Bold',
              type: 'fontWeights',
            },
          },
          alias: {
            value: '$headline',
            type: 'typography',
          },
        },
      }, null, 2),
    );
  });

  it('should return expanded boxShadow token', () => {
    const mockStore = createMockStore({
      tokenState: {
        tokens: {
          global: [
            {
              name: 'shadow',
              value: {
                blur: '2', color: '#000000', spread: '0', type: 'innerShadow', x: '2', y: '2',
              },
              type: TokenTypes.BOX_SHADOW,
            },
            {
              name: 'multiShadow',
              value: [{
                blur: '2', color: '#000000', spread: '0', type: 'innerShadow', x: '2', y: '2',
              }, {
                blur: '4', color: '#000000', spread: '0', type: 'innerShadow', x: '4', y: '4',
              }],
              type: TokenTypes.BOX_SHADOW,
            },
            { name: 'alias', value: '$shadow', type: TokenTypes.BOX_SHADOW },
          ],
        },
      },
    });
    const result = render(
      <Provider store={mockStore}>
        <SingleFileExport onClose={mockClose} />
      </Provider>,
    );
    const expandShadowCheckBox = result.getByTestId('expandShadow');
    fireEvent.click(expandShadowCheckBox);
    const textArea = result.getByRole('textbox');
    expect(textArea).toHaveValue(
      JSON.stringify({
        global: {
          shadow: {
            blur: {
              value: '2',
              type: 'blur',
            },
            color: {
              value: '#000000',
              type: 'color',
            },
            spread: {
              value: '0',
              type: 'spread',
            },
            type: {
              value: 'innerShadow',
              type: 'type',
            },
            x: {
              value: '2',
              type: 'x',
            },
            y: {
              value: '2',
              type: 'y',
            },
          },
          multiShadow: {
            0: {
              blur: {
                value: '2',
                type: 'blur',
              },
              color: {
                value: '#000000',
                type: 'color',
              },
              spread: {
                value: '0',
                type: 'spread',
              },
              type: {
                value: 'innerShadow',
                type: 'type',
              },
              x: {
                value: '2',
                type: 'x',
              },
              y: {
                value: '2',
                type: 'y',
              },
            },
            1: {
              blur: {
                value: '4',
                type: 'blur',
              },
              color: {
                value: '#000000',
                type: 'color',
              },
              spread: {
                value: '0',
                type: 'spread',
              },
              type: {
                value: 'innerShadow',
                type: 'type',
              },
              x: {
                value: '4',
                type: 'x',
              },
              y: {
                value: '4',
                type: 'y',
              },
            },
          },
          alias: {
            value: '$shadow',
            type: 'boxShadow',
          },
        },
      }, null, 2),
    );
  });

  it('should return expanded composition token', () => {
    const mockStore = createMockStore(defaultStore);
    const result = render(
      <Provider store={mockStore}>
        <SingleFileExport onClose={mockClose} />
      </Provider>,
    );
    const expandCompositionCheckBox = result.getByTestId('expandComposition');
    fireEvent.click(expandCompositionCheckBox);
    const textArea = result.getByRole('textbox');
    expect(textArea).toHaveValue(
      JSON.stringify({
        global: {
          white: {
            value: '#ffffff',
            type: 'color',
          },
          headline: {
            value: {
              fontFamily: 'Inter',
              fontWeight: 'Bold',
            },
            type: 'typography',
          },
          shadow: {
            value: {
              blur: '2',
              color: '#000000',
              spread: '0',
              type: 'innerShadow',
              x: '2',
              y: '2',
            },
            type: 'boxShadow',
          },
          composition: {
            fill: {
              value: '$white',
              type: 'fill',
            },
          },
          border: {
            value: {
              color: '$white',
              width: '5px',
            },
            type: 'border',
          },
        },
      }, null, 2),
    );
  });

  it('should return expanded border token', () => {
    const mockStore = createMockStore(defaultStore);
    const result = render(
      <Provider store={mockStore}>
        <SingleFileExport onClose={mockClose} />
      </Provider>,
    );
    const expandBorderCheckBox = result.getByTestId('expandBorder');
    fireEvent.click(expandBorderCheckBox);
    const textArea = result.getByRole('textbox');
    expect(textArea).toHaveValue(
      JSON.stringify({
        global: {
          white: {
            value: '#ffffff',
            type: 'color',
          },
          headline: {
            value: {
              fontFamily: 'Inter',
              fontWeight: 'Bold',
            },
            type: 'typography',
          },
          shadow: {
            value: {
              blur: '2',
              color: '#000000',
              spread: '0',
              type: 'innerShadow',
              x: '2',
              y: '2',
            },
            type: 'boxShadow',
          },
          composition: {
            value: {
              fill: '$white',
            },
            type: 'composition',
          },
          border: {
            color: {
              value: '$white',
              type: 'color',
            },
            width: {
              value: '5px',
              type: 'dimension',
            },
          },
        },
      }, null, 2),
    );
  });
});

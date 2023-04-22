import React from 'react';
import { Provider } from 'react-redux';
import { DownshiftInput } from './DownshiftInput';
import { createMockStore, fireEvent, render } from '../../../../tests/config/setupTest';
import { SingleToken } from '@/types/tokens';
import { TokenTypes } from '@/constants/TokenTypes';
import { BoxShadowTypes } from '@/constants/BoxShadowTypes';

const resolvedTokens = [
  {
    internal__Parent: 'core',
    name: 'border-radius.0',
    rawValue: '64px',
    type: 'borderRadius',
    value: '64px',
  },
  {
    internal__Parent: 'core',
    name: 'border-radius.1',
    rawValue: '1px',
    type: 'borderRadius',
    value: '1px',
  },
  {
    internal__Parent: 'core',
    name: 'border-radius.2',
    rawValue: '2px',
    type: 'borderRadius',
    value: '2px',
  },
  {
    internal__Parent: 'core',
    name: 'color.slate.200',
    rawValue: '#e2e8f0',
    type: 'color',
    value: '#e2e8f0',
  },
  {
    internal__Parent: 'core',
    name: 'color.slate.300',
    rawValue: '#cbd5e1',
    type: 'color',
    value: '#cbd5e1',
  },
  {
    internal__Parent: 'core',
    name: 'color.red.200',
    rawValue: '#b91c1c',
    type: 'color',
    value: '#b91c1c',
  },
  {
    internal__Parent: 'core',
    name: 'size.0',
    rawValue: '0',
    type: 'sizing',
    value: 0,
  },
  {
    internal__Parent: 'core',
    name: 'size.12',
    rawValue: '1',
    type: 'sizing',
    value: 1,
  },
  {
    internal__Parent: 'core',
    name: 'typography.regular',
    rawValue: {
      fontFamily: 'arial',
      fontSize: '12px',
      fontWeight: 'bold',
    },
    type: TokenTypes.TYPOGRAPHY,
    value: {
      fontFamily: 'arial',
      fontSize: '12px',
      fontWeight: 'bold',
    },
  },
  {
    internal__Parent: 'core',
    name: 'boxShadow.regular',
    rawValue: [{
      x: '2',
      y: '2',
      blur: '2',
      spread: '2',
      color: '#000000',
      type: BoxShadowTypes.DROP_SHADOW,
    }],
    type: TokenTypes.BOX_SHADOW,
    value: [{
      x: '2',
      y: '2',
      blur: '2',
      spread: '2',
      color: '#000000',
      type: BoxShadowTypes.DROP_SHADOW,
    }],
  },
] as SingleToken[];

const mockSetInputValue = jest.fn();
const mockHandleChange = jest.fn();

describe('DownShiftInput', () => {
  it('filteredValue should only replace {} or $ and remain all letters', () => {
    const dataStore = [
      {
        input: '{opacity.10}',
        output: 'opacity.10',
      },
      {
        input: '{トランスペアレント.10',
        output: 'トランスペアレント.10',
      },
      {
        input: '$不透 明度.10',
        output: '不透 明度.10',
      },
      {
        input: '$불투명.10',
        output: '불투명.10',
      },
      {
        input: '{अस्पष्टता.10}',
        output: 'अस्पष्टता.10',
      },
      {
        input: 'թափանցիկ.10',
        output: 'թափանցիկ.10',
      },
    ];
    dataStore.forEach((data) => {
      expect(data.input.replace(/[{}$]/g, '')).toBe(data.output);
    });
  });

  it('should return color tokens when type is color', () => {
    const result = render(
      <DownshiftInput
        type="color"
        resolvedTokens={resolvedTokens}
        setInputValue={mockSetInputValue}
        handleChange={mockHandleChange}
        value="{"
        suffix
      />,
    );
    result.getByTestId('downshift-input-suffix-button').click();
    expect(result.getByText('#e2e8f0')).toBeInTheDocument();
    expect(result.getByText('#b91c1c')).toBeInTheDocument();
    result.getByText('#e2e8f0').click();
    expect(result.queryByText('#e2e8f0')).not.toBeInTheDocument();
  });

  it('should return filtered color tokens', async () => {
    const result = render(
      <DownshiftInput
        type="color"
        resolvedTokens={resolvedTokens}
        setInputValue={mockSetInputValue}
        handleChange={mockHandleChange}
        value="{"
        suffix
      />,
    );
    result.getByTestId('downshift-input-suffix-button').click();
    const searchInput = await result.findByTestId('downshift-search-input') as HTMLInputElement;
    fireEvent.change(searchInput, {
      target: { value: 'slate' },
    });
    expect(result.getAllByTestId('downshift-input-item')).toHaveLength(2);
  });

  it('should return all tokens when type is documentation type', () => {
    const result = render(
      <DownshiftInput
        type="tokenName"
        resolvedTokens={resolvedTokens}
        setInputValue={mockSetInputValue}
        handleChange={mockHandleChange}
        value="{"
        suffix
      />,
    );
    result.getByTestId('downshift-input-suffix-button').click();
    expect(result.getAllByTestId('downshift-input-item')).toHaveLength(10);
  });

  it('should return fontValues when type is fontFamily', () => {
    const mockStore = createMockStore({
      uiState: {
        figmaFonts: [
          {
            fontName: {
              family: 'ABeeZee',
              style: 'Italic',
            },
          },
          {
            fontName: {
              family: 'Abril Fatface',
              style: 'Regular',
            },
          },
        ],
      },
    });
    const result = render(
      <Provider store={mockStore}>
        <DownshiftInput
          type="fontFamilies"
          resolvedTokens={resolvedTokens}
          setInputValue={mockSetInputValue}
          handleChange={mockHandleChange}
          value="{"
          suffix
        />
      </Provider>,
    );

    result.getByTestId('downshift-input-suffix-button').click();
    result.getByText('Fonts').click();
    expect(result.getAllByTestId('downshift-input-item')).toHaveLength(2);
    result.getAllByTestId('downshift-input-item')[0].click();
    expect(result.queryByTestId('downshift-input-item')).not.toBeInTheDocument();
  });

  it('should return fontWeights when type is fontWeight', () => {
    const mockStore = createMockStore({
      uiState: {
        figmaFonts: [
          {
            fontName: {
              family: 'ABeeZee',
              style: 'Italic',
            },
          },
          {
            fontName: {
              family: 'Abril Fatface',
              style: 'Regular',
            },
          },
        ],
      },
    });
    const result = render(
      <Provider store={mockStore}>
        <DownshiftInput
          type="fontWeights"
          resolvedTokens={resolvedTokens}
          setInputValue={mockSetInputValue}
          handleChange={mockHandleChange}
          value="{"
          externalFontFamily="ABeeZee"
          suffix
        />
      </Provider>,
    );

    result.getByTestId('downshift-input-suffix-button').click();
    result.getByText('Weights').click();
    expect(result.getAllByTestId('downshift-input-item')).toHaveLength(1);
    fireEvent.focus(result.getByTestId('mention-input-value'));
    expect(result.queryByTestId('downshift-input-item')).not.toBeInTheDocument();
  });

  it('should blankBox when there is no matching suggestions', async () => {
    const result = render(
      <DownshiftInput
        type="color"
        resolvedTokens={resolvedTokens}
        setInputValue={mockSetInputValue}
        handleChange={mockHandleChange}
        value="{"
        suffix
      />,
    );
    result.getByTestId('downshift-input-suffix-button').click();
    const searchInput = await result.findByTestId('downshift-search-input') as HTMLInputElement;
    fireEvent.change(searchInput, {
      target: { value: 'nonexist' },
    });
    expect(result.getByText('No suggestions found')).toBeInTheDocument();
  });
});

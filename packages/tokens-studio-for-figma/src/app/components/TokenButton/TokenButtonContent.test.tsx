import React from 'react';
import { Provider } from 'react-redux';
import { createMockStore, render } from '../../../../tests/config/setupTest';
import TokenButtonContent from './TokenButtonContent';
import { TokensContext } from '@/context';
import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken } from '@/types/tokens';
import { ResolveTokenValuesResult } from '@/utils/tokenHelpers';
import { gradientTokenToCss } from '@/utils/color';

jest.mock('@/utils/color', () => {
  const actual = jest.requireActual('@/utils/color');
  return { ...actual, gradientTokenToCss: jest.fn(actual.gradientTokenToCss) };
});

const brand = { name: 'color.brand', value: '#ff0000', type: TokenTypes.COLOR } as ResolveTokenValuesResult;

function renderButton(token: SingleToken, {
  resolvedTokens = [], displayType = 'GRID' as const, type = token.type as TokenTypes,
}: { resolvedTokens?: ResolveTokenValuesResult[]; displayType?: 'GRID' | 'LIST'; type?: TokenTypes } = {}) {
  const mockStore = createMockStore({ uiState: { displayType } });
  return render(
    <Provider store={mockStore}>
      <TokensContext.Provider value={{ resolvedTokens }}>
        <TokenButtonContent token={token} type={type} active={false} onClick={jest.fn()} />
      </TokensContext.Provider>
    </Provider>,
  );
}

describe('TokenButtonContent', () => {
  it('only shows the name of a color token in the list view', () => {
    const list = renderButton(brand, { resolvedTokens: [brand], displayType: 'LIST' });
    expect(list.getByText('brand')).toBeInTheDocument();
    list.unmount();

    const grid = renderButton(brand, { resolvedTokens: [brand], displayType: 'GRID' });
    expect(grid.queryByText('brand')).not.toBeInTheDocument();
  });

  it('renders a gradient swatch with aliased stops resolved', () => {
    const gradient = {
      name: 'gradient.alias-stops',
      type: TokenTypes.GRADIENT,
      value: { kind: 'linear', angle: 90, stops: [{ color: '{color.brand}', position: 0 }, { color: '#0000ff', position: 1 }] },
    } as unknown as ResolveTokenValuesResult;
    renderButton(gradient, { resolvedTokens: [brand, gradient] });
    expect(gradientTokenToCss).toHaveBeenLastCalledWith(expect.objectContaining({
      stops: [{ color: '#ff0000', position: 0 }, { color: '#0000ff', position: 1 }],
    }));
  });

  it('falls back to the raw gradient value when the resolved value is not a gradient', () => {
    const gradient = {
      name: 'gradient.raw',
      type: TokenTypes.GRADIENT,
      value: { kind: 'linear', angle: 90, stops: [{ color: '#00ff00', position: 0 }, { color: '#00ffaa', position: 1 }] },
    } as unknown as SingleToken;
    renderButton(gradient, { resolvedTokens: [{ ...gradient, value: 42 } as unknown as ResolveTokenValuesResult] });
    expect(gradientTokenToCss).toHaveBeenLastCalledWith(gradient.value);
  });

  it('uses a resolved css gradient string as is', () => {
    const css = 'linear-gradient(90deg, #123456 0%, #654321 100%)';
    const gradient = { name: 'gradient.css', type: TokenTypes.GRADIENT, value: css } as SingleToken;
    const { getByRole } = renderButton(gradient, { resolvedTokens: [gradient as ResolveTokenValuesResult] });
    expect(getByRole('button')).toBeInTheDocument();
    expect(gradientTokenToCss).not.toHaveBeenCalled();
  });

  it('rounds the corners of a border radius token by its value', () => {
    const radius = { name: 'radius.pill', type: TokenTypes.BORDER_RADIUS, value: '13' } as ResolveTokenValuesResult;
    const { getByText } = renderButton(radius, { resolvedTokens: [radius] });
    expect(getByText('pill')).toBeInTheDocument();
  });
});

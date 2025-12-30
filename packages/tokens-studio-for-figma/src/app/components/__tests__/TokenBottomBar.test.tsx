import React from 'react';
import { Provider } from 'react-redux';
import userEvent from '@testing-library/user-event';
import { createMockStore, render, waitFor } from '../../../../tests/config/setupTest';
import { TokenTypes } from '@/constants/TokenTypes';

import TokensBottomBar from '../TokensBottomBar';
import { BoxShadowTypes } from '@/constants/BoxShadowTypes';

function emptyFunc() {}

describe('TokenBottomBar', () => {
  it('should render', () => {
    const mockStore = createMockStore({});

    render(
      <Provider store={mockStore}>
        <TokensBottomBar handleError={emptyFunc} />
      </Provider>,
    );
  });
  // 37,41,52-56,63-69
  it('should show the preset modal', async () => {
    const mockStore = createMockStore({});

    const result = render(
      <Provider store={mockStore}>
        <TokensBottomBar handleError={emptyFunc} />
      </Provider>,
    );

    const toolsButton = await result.findByLabelText('load_export');
    await userEvent.click(toolsButton);
    const loadButton = await result.findByText('loadFromPreset');
    await userEvent.click(loadButton, { pointerEventsCheck: 0 });
    expect(result.queryByText('importFromPreset')).toBeInTheDocument();

    const closeButton = await result.findByTestId('close-button');
    closeButton.click();
    waitFor(() => {
      expect(result.queryByText('importFromPreset')).toBeNull();
    });
  });

  it('should show the resolve duplicate modal', async () => {
    const mockStore = createMockStore({
      tokenState: {
        activeTokenSet: 'global',
        tokens: {
          global: [
            {
              name: 'buttons.default',
              type: TokenTypes.COLOR,
              value: '#ffffff',
              description: 'regular color token',
            },
            {
              name: 'buttons.default',
              type: TokenTypes.COLOR,
              value: '#000000',
              description: 'regular color token',
            },
            {
              name: 'boxShadow.default',
              type: TokenTypes.BOX_SHADOW,
              value: [
                {
                  x: '4',
                  y: '0',
                  blur: '0',
                  spread: '0',
                  color: '#000000',
                  type: BoxShadowTypes.INNER_SHADOW,
                },
                {
                  x: '4',
                  y: '0',
                  blur: '0',
                  spread: '0',
                  color: '#000000',
                  type: BoxShadowTypes.INNER_SHADOW,
                },
              ],
            },
            {
              name: 'boxShadow.default',
              type: TokenTypes.BOX_SHADOW,
              value: [
                {
                  x: '2',
                  y: '0',
                  blur: '0',
                  spread: '0',
                  color: '#000000',
                  type: BoxShadowTypes.INNER_SHADOW,
                },
                {
                  x: '2',
                  y: '0',
                  blur: '0',
                  spread: '0',
                  color: '#000000',
                  type: BoxShadowTypes.INNER_SHADOW,
                },
              ],
            },
            {
              name: 'composition.default',
              type: TokenTypes.COMPOSITION,
              value: {
                height: '20px',
                minHeight: '20px',
              },
            },
            {
              name: 'composition.default',
              type: TokenTypes.COMPOSITION,
              value: {
                height: '40px',
                minHeight: '40px',
              },
            },
          ],
        },
      },
    });

    const result = render(
      <Provider store={mockStore}>
        <TokensBottomBar handleError={emptyFunc} />
      </Provider>,
    );

    const toolsButton = await result.findByLabelText('load_export');
    await userEvent.click(toolsButton);
    const resolveDuplicateModalButton = await result.findByTestId('resolve-duplicate-modal-open-button');
    await userEvent.click(resolveDuplicateModalButton, { pointerEventsCheck: 0 });
    expect(result.queryByText('resolveDuplicateTokensModal.title')).toBeInTheDocument();

    const closeButton = await result.findByTestId('close-button');
    closeButton.click();
    waitFor(() => {
      expect(result.queryByText('resolveDuplicateTokensModal.title')).toBeNull();
    });
  });

  it('should show the export modal', async () => {
    const mockStore = createMockStore({});

    const result = render(
      <Provider store={mockStore}>
        <TokensBottomBar handleError={emptyFunc} />
      </Provider>,
    );

    const toolsButton = await result.findByLabelText('load_export');
    await userEvent.click(toolsButton);
    const exportButton = await result.findByText('exportToFile');
    await userEvent.click(exportButton, { pointerEventsCheck: 0 });
    expect(result.queryByText('Export tokens')).toBeInTheDocument();
  });
});

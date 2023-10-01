import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react-hooks';
import ConfirmDialog from '../ConfirmDialog';
import {
  act, createMockStore, render,
} from '../../../../tests/config/setupTest';
import useConfirm, { ResolveCallbackPayload } from '@/app/hooks/useConfirm';

describe('ConfirmDialog', () => {
  it('should work', async () => {
    const mockStore = createMockStore({});

    const { result: useConfirmResult } = renderHook(
      () => useConfirm(),
      {
        wrapper: ({ children }: PropsWithChildren<unknown>) => (
          <Provider store={mockStore}>
            {children}
          </Provider>
        ),
      },
    );

    const result = render(
      <Provider store={mockStore}>
        <ConfirmDialog />
      </Provider>,
    );

    let confirmPromise = new Promise<ResolveCallbackPayload<boolean>>(() => {});
    await act(async () => {
      confirmPromise = useConfirmResult.current.confirm({
        text: 'You have unsaved changes',
        description: 'If you create or switch your branch without pushing your local changes to your repository, the changes will be lost.',
        confirmAction: 'Discard changes',
        cancelAction: 'Cancel',
      });
    });

    expect(result.queryByText('You have unsaved changes')).toBeInTheDocument();
    expect(result.queryByText('If you create or switch your branch without pushing your local changes to your repository, the changes will be lost.')).toBeInTheDocument();
    expect(result.queryByText('Discard changes')).toBeInTheDocument();
    expect(result.queryByText('Cancel')).toBeInTheDocument();

    await act(async () => {
      const confirmButton = result.queryByText('Discard changes') as HTMLButtonElement;
      confirmButton.click();
    });

    expect(mockStore.getState().uiState.confirmState.show).toBe(false);
    expect(await confirmPromise).toEqual({
      data: [],
      result: true,
    });
  });

  it('can show options', async () => {
    const mockStore = createMockStore({});

    const { result: useConfirmResult } = renderHook(
      () => useConfirm(),
      {
        wrapper: ({ children }: PropsWithChildren<unknown>) => (
          <Provider store={mockStore}>
            {children}
          </Provider>
        ),
      },
    );

    const result = render(
      <Provider store={mockStore}>
        <ConfirmDialog />
      </Provider>,
    );

    let confirmPromise = new Promise<ResolveCallbackPayload<string[]>>(() => {});
    await act(async () => {
      confirmPromise = useConfirmResult.current.confirm({
        text: 'Create styles',
        description: 'What styles should be created?',
        confirmAction: 'Create',
        choices: [
          { key: 'colorStyles', label: 'Color', enabled: true },
          { key: 'textStyles', label: 'Text', enabled: true },
          { key: 'effectStyles', label: 'Shadows', enabled: true },
        ],
      });
      // @README the ConfirmDialog has a 50ms timeout effect
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 100);
      });
    });

    expect(result.queryByTestId('colorStyles')).toBeInTheDocument();
    expect(result.queryByTestId('textStyles')).toBeInTheDocument();
    expect(result.queryByTestId('effectStyles')).toBeInTheDocument();

    await act(async () => {
      const colorStylesCheckbox = await result.findByTestId('colorStyles');
      colorStylesCheckbox.click();
    });

    await act(async () => {
      const confirmButton = result.queryByText('Create') as HTMLButtonElement;
      confirmButton.click();
    });

    expect(mockStore.getState().uiState.confirmState.show).toEqual(false);
    expect(await confirmPromise).toEqual({
      result: true,
      data: ['textStyles', 'effectStyles'],
    });
  });
});

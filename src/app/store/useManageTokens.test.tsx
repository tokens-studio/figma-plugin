import React from 'react';
import { init, RematchStore } from '@rematch/core';
import { renderHook, act } from '@testing-library/react-hooks';
import { Provider } from 'react-redux';
import { RootModel } from '@/types/RootModel';
import { models } from './models';
import { AllTheProviders } from '../../../tests/config/setupTest';
import useManageTokens from './useManageTokens';
import { TokenTypes } from '@/constants/TokenTypes';

const mockConfirm = jest.fn();

jest.mock('../hooks/useConfirm', () => ({
  __esModule: true,
  default: () => ({
    confirm: mockConfirm,
  }),
}));

type Store = RematchStore<RootModel, Record<string, never>>;

describe('useManageToken test', () => {
  let store: Store;
  let { result } = renderHook(() => useManageTokens(), {
    wrapper: AllTheProviders,
  });

  beforeEach(() => {
    store = init<RootModel>({
      redux: {
        initialState: {
          tokenState: {
            tokens: {
              global: [
                {
                  name: 'size.new',
                  type: TokenTypes.SIZING,
                  value: '12px',
                },
                {
                  name: 'size.primary',
                  type: TokenTypes.SIZING,
                  value: '16px',
                },
              ],
            },
            activeTokenSet: 'global',
          },
        },
      },
      models,
    });
    result = renderHook(() => useManageTokens(), {
      wrapper: ({ children }: { children?: React.ReactNode }) => <Provider store={store}>{children}</Provider>,
    }).result;
  });

  it('editSingleToken test', async () => {
    const tokenToEdit = {
      parent: 'global',
      type: TokenTypes.SIZING,
      name: 'size.new',
      value: '12px',
      oldName: 'size-old',
    };
    expect(result.current.editSingleToken(tokenToEdit)).toBeTruthy();
  });

  it('createSingleToken test', async () => {
    const tokenToCreate = {
      parent: 'global',
      type: TokenTypes.SIZING,
      name: 'size.new',
      value: '12px',
    };
    expect(result.current.createSingleToken(tokenToCreate)).toBeTruthy();
  });

  it('duplicateSingleToken test', async () => {
    const tokenToDuplicate = {
      parent: 'global',
      type: TokenTypes.SIZING,
      newName: 'size.new',
      value: '12px',
      oldName: 'size-old',
    };
    expect(result.current.duplicateSingleToken(tokenToDuplicate)).toBeTruthy();
  });

  it('can\'t delete a token when user doesn\'t agree', async () => {
    const tokenToDelete = {
      parent: 'global',
      path: 'size.new',
    };
    mockConfirm.mockImplementationOnce(() => Promise.resolve(false));
    await act(async () => result.current.deleteSingleToken(tokenToDelete));

    expect(store.getState().tokenState.tokens.global).toEqual([
      {
        name: 'size.new',
        type: TokenTypes.SIZING,
        value: '12px',
      },
      {
        name: 'size.primary',
        type: TokenTypes.SIZING,
        value: '16px',
      },
    ]);
  });

  it('should be able to delete a token', async () => {
    const tokenToDelete = {
      parent: 'global',
      path: 'size.new',
    };
    mockConfirm.mockImplementationOnce(() => Promise.resolve(true));
    await act(async () => result.current.deleteSingleToken(tokenToDelete));

    expect(store.getState().tokenState.tokens.global).toEqual([
      {
        name: 'size.primary',
        type: TokenTypes.SIZING,
        value: '16px',
      },
    ]);
  });

  it('renameGroup test', async () => {
    const path = 'size';
    const newName = 'newGroup';
    const type = TokenTypes.SIZING;
    await act(async () => result.current.renameGroup(path, newName, type));

    expect(store.getState().tokenState.tokens.global).toEqual([
      {
        name: 'newGroup.new',
        type: TokenTypes.SIZING,
        value: '12px',
      },
      {
        name: 'newGroup.primary',
        type: TokenTypes.SIZING,
        value: '16px',
      },
    ]);
  });

  it('duplicateGroup test', async () => {
    const path = 'size';
    const type = TokenTypes.SIZING;
    await act(async () => result.current.duplicateGroup(path, type));

    expect(store.getState().tokenState.tokens.global).toEqual([
      {
        name: 'size.new',
        type: TokenTypes.SIZING,
        value: '12px',
      },
      {
        name: 'size.primary',
        type: TokenTypes.SIZING,
        value: '16px',
      },
      {
        name: 'size-copy.new',
        type: TokenTypes.SIZING,
        value: '12px',
      },
      {
        name: 'size-copy.primary',
        type: TokenTypes.SIZING,
        value: '16px',
      },
    ]);
  });
});

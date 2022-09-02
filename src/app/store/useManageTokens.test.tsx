import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import useManageTokens from './useManageTokens';
import { AllTheProviders } from '../../../tests/config/setupTest';

const mockConfirm = jest.fn();
const mockRemoveStylesFromTokens = jest.fn();

jest.mock('../hooks/useConfirm', () => ({
  __esModule: true,
  default: () => ({
    confirm: mockConfirm,
  }),
}));

jest.mock('./useTokens', () => ({
  __esModule: true,
  default: () => ({
    removeStylesFromTokens: mockRemoveStylesFromTokens,
  }),
}));

describe('useManageTokens', () => {
  it('should be able to remove styles from the currentTheme when the user select option', async () => {
    const tokenToDelete = {
      path: 'color.red',
      parent: 'global',
    };
    mockConfirm.mockImplementation(() => Promise.resolve({ data: ['delete-style'] }));
    const { result } = renderHook(() => useManageTokens(), {
      wrapper: AllTheProviders,
    });
    await act(async () => result.current.deleteSingleToken(tokenToDelete));
    expect(mockRemoveStylesFromTokens).toBeCalledTimes(1);
  });

  it('doesn\'t remove styles from the currentTheme when the user doesn\'t select option', async () => {
    const tokenToDelete = {
      path: 'color.red',
      parent: 'global',
    };
    mockConfirm.mockImplementation(() => Promise.resolve({ data: [] }));
    const { result } = renderHook(() => useManageTokens(), {
      wrapper: AllTheProviders,
    });
    await act(async () => result.current.deleteSingleToken(tokenToDelete));
    expect(mockRemoveStylesFromTokens).toBeCalledTimes(0);
  });
});

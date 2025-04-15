import { renderHook } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { useStorageSizeWarning } from '@/app/hooks/useStorageSizeWarning';
import useConfirm from '@/app/hooks/useConfirm';

// Mock modules
jest.mock('@/app/hooks/useConfirm');
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({
    t: (key: string) => key,
  })),
}));

describe('useStorageSizeWarning', () => {
  // Setup mocks before each test
  beforeEach(() => {
    const mockConfirm = jest.fn();
    (useConfirm as jest.Mock).mockReturnValue({ confirm: mockConfirm });
  });

  it('should not show warning when size is less than 90', () => {
    const { result } = renderHook(() => useStorageSizeWarning(80));
    const mockConfirm = useConfirm().confirm;

    result.current();

    expect(mockConfirm).not.toHaveBeenCalled();
  });

  it('should show warning when size is >= 90', () => {
    const { result } = renderHook(() => useStorageSizeWarning(95));
    const mockConfirm = useConfirm().confirm;

    result.current();

    expect(mockConfirm).toHaveBeenCalledWith({
      text: 'storageLimitWarning.title',
      description: 'storageLimitWarning.description',
      confirmAction: 'storageLimitWarning.switchToRemote',
      cancelAction: 'storageLimitWarning.useClientStorage',
    });
  });

  it('should call useTranslation with correct namespace', () => {
    renderHook(() => useStorageSizeWarning(95));
    expect(useTranslation).toHaveBeenCalledWith(['tokens']);
  });
});

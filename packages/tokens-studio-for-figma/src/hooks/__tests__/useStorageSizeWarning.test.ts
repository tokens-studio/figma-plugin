import { renderHook } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { useStorageSizeWarning } from '@/app/hooks/useStorageSizeWarning';
import useConfirm from '@/app/hooks/useConfirm';

// Mock useDispatch
jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
}));

// Mock other modules
jest.mock('@/app/hooks/useConfirm');
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({
    t: (key: string) => key,
  })),
}));

describe('useStorageSizeWarning', () => {
  beforeEach(() => {
    const mockConfirm = jest.fn();
    (useConfirm as jest.Mock).mockReturnValue({ confirm: mockConfirm });
  });

  it('should show warning dialog with correct text', () => {
    const { result } = renderHook(() => useStorageSizeWarning());
    const mockConfirm = useConfirm().confirm;

    result.current();

    expect(mockConfirm).toHaveBeenCalledWith({
      text: 'storageLimitWarning.title',
      description: 'storageLimitWarning.description',
      confirmAction: 'storageLimitWarning.switchToRemote',
    });
  });

  it('should call useTranslation with correct namespace', () => {
    renderHook(() => useStorageSizeWarning());
    expect(useTranslation).toHaveBeenCalledWith(['tokens']);
  });
});

import { renderHook } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { useStorageSizeWarning } from '@/app/hooks/useStorageSizeWarning';
import useConfirm from '@/app/hooks/useConfirm';
import { Tabs } from '@/constants/Tabs';

const mockDispatchAction = jest.fn();
const mockDispatch = jest.fn(() => ({
  uiState: {
    setActiveTab: mockDispatchAction,
  },
}));

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch(),
}));

// Mock other modules
jest.mock('@/app/hooks/useConfirm');
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({
    t: (key: string) => key,
  })),
}));

describe('useStorageSizeWarning', () => {
  let mockConfirm: jest.Mock;

  beforeEach(() => {
    mockConfirm = jest.fn();
    (useConfirm as jest.Mock).mockReturnValue({ confirm: mockConfirm });
    mockDispatchAction.mockClear();
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

  it('should navigate to Settings tab when confirm action is clicked', async () => {
    // Mock confirm to resolve with true (as if user clicked confirm)
    mockConfirm.mockResolvedValueOnce(true);

    const { result } = renderHook(() => useStorageSizeWarning());

    // Call the hook function
    await result.current();

    // Verify that dispatch was called to set active tab to Settings
    expect(mockDispatchAction).toHaveBeenCalledWith(Tabs.SETTINGS);
  });
});

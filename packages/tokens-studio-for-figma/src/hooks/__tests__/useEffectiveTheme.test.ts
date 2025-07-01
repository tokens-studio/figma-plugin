import { renderHook } from '@testing-library/react';
import { useSelector } from 'react-redux';
import { useEffectiveTheme } from '../useEffectiveTheme';
import { useFigmaTheme } from '../useFigmaTheme';

// Mock the dependencies
jest.mock('../useFigmaTheme');
jest.mock('react-redux');

const mockUseFigmaTheme = useFigmaTheme as jest.MockedFunction<typeof useFigmaTheme>;
const mockUseSelector = useSelector as jest.MockedFunction<typeof useSelector>;

describe('useEffectiveTheme', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return dark theme when preference is dark', () => {
    mockUseFigmaTheme.mockReturnValue({ isDarkTheme: false });
    mockUseSelector.mockReturnValue('dark');

    const { result } = renderHook(() => useEffectiveTheme());

    expect(result.current.isDarkTheme).toBe(true);
    expect(result.current.themePreference).toBe('dark');
  });

  it('should return light theme when preference is light', () => {
    mockUseFigmaTheme.mockReturnValue({ isDarkTheme: true });
    mockUseSelector.mockReturnValue('light');

    const { result } = renderHook(() => useEffectiveTheme());

    expect(result.current.isDarkTheme).toBe(false);
    expect(result.current.themePreference).toBe('light');
  });

  it('should follow Figma theme when preference is auto', () => {
    mockUseFigmaTheme.mockReturnValue({ isDarkTheme: true });
    mockUseSelector.mockReturnValue('auto');

    const { result } = renderHook(() => useEffectiveTheme());

    expect(result.current.isDarkTheme).toBe(true);
    expect(result.current.themePreference).toBe('auto');
  });

  it('should follow Figma theme when preference is undefined', () => {
    mockUseFigmaTheme.mockReturnValue({ isDarkTheme: false });
    mockUseSelector.mockReturnValue(undefined);

    const { result } = renderHook(() => useEffectiveTheme());

    expect(result.current.isDarkTheme).toBe(false);
    expect(result.current.themePreference).toBe(undefined);
  });
});

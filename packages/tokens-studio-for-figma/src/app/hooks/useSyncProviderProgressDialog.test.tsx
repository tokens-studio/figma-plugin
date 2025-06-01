import React from 'react';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { useSyncProviderProgressDialog } from './useSyncProviderProgressDialog';
import { store } from '../store';

// Mock React hooks and Redux
const mockDispatch = {
  uiState: {
    setShowSyncProviderDialog: jest.fn(),
    setSyncProviderName: jest.fn(),
    startJob: jest.fn(),
    completeJob: jest.fn(),
  },
};

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: jest.fn(),
}));

describe('useSyncProviderProgressDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock useSelector to return default values
    const mockUseSelector = require('react-redux').useSelector;
    mockUseSelector.mockImplementation((selector: any) => {
      if (selector.toString().includes('backgroundJobs')) {
        return [];
      }
      if (selector.toString().includes('showSyncProviderDialog')) {
        return false;
      }
      return undefined;
    });
  });

  it('should initialize with correct default values', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(Provider, { store }, children)
    );

    const { result } = renderHook(() => useSyncProviderProgressDialog(), {
      wrapper,
    });

    expect(result.current.showSyncProviderDialog).toBe(false);
    expect(typeof result.current.showDialog).toBe('function');
    expect(typeof result.current.hideDialog).toBe('function');
    expect(typeof result.current.showSuccess).toBe('function');
  });

  it('should call correct actions when showDialog is called', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(Provider, { store }, children)
    );

    const { result } = renderHook(() => useSyncProviderProgressDialog(), {
      wrapper,
    });

    result.current.showDialog('GitHub');

    expect(mockDispatch.uiState.setShowSyncProviderDialog).toHaveBeenCalledWith('loading');
    expect(mockDispatch.uiState.setSyncProviderName).toHaveBeenCalledWith('GitHub');
    expect(mockDispatch.uiState.startJob).toHaveBeenCalledWith({
      name: 'ui_sync_provider_setup',
    });
  });

  it('should call correct actions when hideDialog is called', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(Provider, { store }, children)
    );

    const { result } = renderHook(() => useSyncProviderProgressDialog(), {
      wrapper,
    });

    result.current.hideDialog();

    expect(mockDispatch.uiState.setShowSyncProviderDialog).toHaveBeenCalledWith(false);
    expect(mockDispatch.uiState.setSyncProviderName).toHaveBeenCalledWith('');
    expect(mockDispatch.uiState.completeJob).toHaveBeenCalledWith('ui_sync_provider_setup');
  });

  it('should call correct actions when showSuccess is called', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(Provider, { store }, children)
    );

    const { result } = renderHook(() => useSyncProviderProgressDialog(), {
      wrapper,
    });

    result.current.showSuccess();

    expect(mockDispatch.uiState.setShowSyncProviderDialog).toHaveBeenCalledWith('success');
  });
});
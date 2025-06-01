import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { SyncProviderProgressDialog } from './SyncProviderProgressDialog';
import { store } from '../store';

// Mock the translation hook
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      const translations: Record<string, string> = {
        'settingUpProvider': 'Setting up sync provider',
        'providerSetupComplete': 'Sync provider setup complete',
        'connectingToProvider': `Connecting to ${options?.provider || 'provider'}`,
        'validatingCredentials': 'Validating credentials and checking connection...',
        'allDone': 'All done!',
        'providerConnectedSuccessfully': `${options?.provider || 'provider'} connected successfully`,
        'close': 'Close',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock the useSyncProviderProgressDialog hook
let mockDialogState: any = false;
let mockProviderName = '';

jest.mock('../hooks/useSyncProviderProgressDialog', () => ({
  useSyncProviderProgressDialog: () => ({
    showSyncProviderDialog: mockDialogState,
    hideDialog: jest.fn(),
  }),
}));

// Mock useSelector for syncProviderName
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => {
    if (selector.toString().includes('syncProviderName')) {
      return mockProviderName;
    }
    return jest.requireActual('react-redux').useSelector(selector);
  },
}));

describe('SyncProviderProgressDialog', () => {
  beforeEach(() => {
    mockDialogState = false;
    mockProviderName = '';
  });

  it('does not render when dialog is closed', () => {
    mockDialogState = false;
    
    render(
      <Provider store={store}>
        <SyncProviderProgressDialog />
      </Provider>
    );

    expect(screen.queryByText('Setting up sync provider')).toBeNull();
  });

  it('renders loading state correctly', () => {
    mockDialogState = 'loading';
    mockProviderName = 'GitHub';

    render(
      <Provider store={store}>
        <SyncProviderProgressDialog />
      </Provider>
    );

    expect(screen.getByText('Setting up sync provider')).toBeDefined();
    expect(screen.getByText('Connecting to GitHub')).toBeDefined();
    expect(screen.getByText('Validating credentials and checking connection...')).toBeDefined();
  });

  it('renders success state correctly', () => {
    mockDialogState = 'success';
    mockProviderName = 'GitHub';

    render(
      <Provider store={store}>
        <SyncProviderProgressDialog />
      </Provider>
    );

    expect(screen.getByText('Sync provider setup complete')).toBeDefined();
    expect(screen.getByText('All done!')).toBeDefined();
    expect(screen.getByText('GitHub connected successfully')).toBeDefined();
    expect(screen.getByText('Close')).toBeDefined();
  });
});
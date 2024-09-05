import { AsyncMessageTypes, StartupMessage } from '@/types/AsyncMessages';

const startupParams = {};

const baseStartupParams = {
  settings: {},
  activeTheme: {},
  authData: null,
  lastOpened: 0,
  onboardingExplainer: {
    exportSets: true,
    inspect: true,
    sets: true,
    syncProviders: true,
  },
  storageType: { provider: 'local' },
  localApiProviders: null,
  licenseKey: null,
  initialLoad: false,
  localTokenData: null,
  user: null,
  usedEmail: null,
};

export const startupMessage: Omit<StartupMessage, 'licenseKey'> = {
  ...baseStartupParams,
  type: AsyncMessageTypes.STARTUP,
  activeTheme: {},
  lastOpened: Date.now(),
  initialLoad: false,
  usedEmail: null,
  authData: null,
  onboardingExplainer: {
    sets: true,
    exportSets: true,
    inspect: true,
    syncProviders: true,
  },
  localApiProviders: [],
  settings: mockSettings,
  storageType: {
    provider: StorageProviderType.LOCAL,
  },
  user: mockUser,
  localTokenData: {
    activeTheme: '',
    checkForChanges: true,
    themes: [],
    usedTokenSet: null,
    updatedAt: new Date().toISOString(),
    values: {},
    collapsedTokenSets: null,
    tokenFormat: TokenFormatOptions.Legacy,
    version: '91',
  },
};

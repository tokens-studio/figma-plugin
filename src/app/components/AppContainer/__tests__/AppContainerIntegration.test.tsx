import React from 'react';
import { Provider } from 'react-redux';
import { Entitlements } from '@/app/store/models/userState';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { TokenTypes } from '@/constants/TokenTypes';
import {
  ApiProvidersProperty,
  CheckForChangesProperty,
  StorageTypeProperty,
  ThemesProperty,
  ValuesProperty,
  LicenseKeyProperty,
} from '@/figmaStorage';
import * as validateLicenseModule from '@/utils/validateLicense';
import {
  act, screen, createMockStore, render, waitFor, fireEvent,
} from '../../../../../tests/config/setupTest';
import { mockGetContent } from '../../../../../tests/__mocks__/octokitRestMock';
import { AppContainer } from '../AppContainer';
import { AsyncMessageTypes, StartupMessage } from '@/types/AsyncMessages';
import { SavedSettings } from '@/plugin/notifiers';
import { UpdateMode } from '@/constants/UpdateMode';
import { AnyTokenList } from '@/types/tokens';
import { StorageType, StorageTypeCredentials } from '@/types/StorageType';
import { ThemeObjectsList } from '@/types';

const storageTypePropertyReadSpy = jest.spyOn(StorageTypeProperty, 'read');
const apiProvidersPropertyReadSpy = jest.spyOn(ApiProvidersProperty, 'read');
const valuesPropertyReadSpy = jest.spyOn(ValuesProperty, 'read');
const themesPropertyReadSpy = jest.spyOn(ThemesProperty, 'read');
const checkForChangesPropertyReadSpy = jest.spyOn(CheckForChangesProperty, 'read');
const licenseKeyPropertyReadSpy = jest.spyOn(LicenseKeyProperty, 'read');
const validateLicenseSpy = jest.spyOn(validateLicenseModule, 'default');

// Hide error calls unless they are expected. This is mainly related to react-modal
jest.spyOn(console, 'error').mockImplementation(() => { });
// Hide warn calls from shortcut hooks
jest.spyOn(console, 'warn').mockImplementation(() => { });

const mockUser = {
  figmaId: 'figma:1234',
  userId: 'uid:1234',
  name: 'Jan Six',
};

const mockSettings: SavedSettings = {
  width: 800,
  height: 500,
  ignoreFirstPartForStyles: false,
  inspectDeep: false,
  prefixStylesWithThemeName: false,
  showEmptyGroups: true,
  updateMode: UpdateMode.PAGE,
  updateOnChange: false,
  updateRemote: true,
  updateStyles: true,
};

const mockValues: Record<string, AnyTokenList> = {
  global: [
    {
      type: TokenTypes.COLOR,
      value: '#ff0000',
      name: 'red',
    },
    {
      type: TokenTypes.COLOR,
      value: '#000000',
      name: 'black',
    },
    {
      type: TokenTypes.BORDER_RADIUS,
      value: '12px',
      name: 'rounded.md',
    },
  ],
  playground: [
    {
      type: TokenTypes.COLOR,
      value: '#ff0000',
      name: 'red',
    },
  ],
};

const mockGithubStoragetype: StorageType = {
  provider: StorageProviderType.GITHUB,
  id: 'github',
  internalId: 'github',
  name: 'Github',
  branch: 'main',
  filePath: 'data/tokens.json',
};

const mockGithubApiProviders: StorageTypeCredentials[] = [
  {
    provider: StorageProviderType.GITHUB,
    id: 'github',
    internalId: 'github',
    name: 'Github',
    branch: 'main',
    filePath: 'data/tokens.json',
    secret: 'github-secret',
  },
];

const mockThemes: ThemeObjectsList = [
  {
    id: 'light',
    name: 'Light',
    selectedTokenSets: {
      global: TokenSetStatus.ENABLED,
    },
  },
];

const mockStartupParams: Omit<StartupMessage, 'licenseKey'> = {
  type: AsyncMessageTypes.STARTUP,
  activeTheme: {},
  lastOpened: Date.now(),
  onboardingExplainer: {
    sets: true,
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
    activeTheme: {},
    checkForChanges: true,
    themes: [],
    usedTokenSet: {},
    updatedAt: new Date().toISOString(),
    values: {},
    version: '91',
  },
};

// #region helpers
const resetSuite = () => {
  storageTypePropertyReadSpy.mockReset();
  apiProvidersPropertyReadSpy.mockReset();
  valuesPropertyReadSpy.mockReset();
  themesPropertyReadSpy.mockReset();
  checkForChangesPropertyReadSpy.mockReset();
  licenseKeyPropertyReadSpy.mockReset();
  validateLicenseSpy.mockReset();
};

const mockGithubGetContent = () => {
  mockGetContent.mockImplementation(() => (
    Promise.resolve({
      data: {
        content: 'ewogICJnbG9iYWwiOiB7CiAgICAicmVkIjogewogICAgICAidHlwZSI6ICJjb2xvciIsCiAgICAgICJuYW1lIjogInJlZCIsCiAgICAgICJ2YWx1ZSI6ICIjZmYwMDAwIgogICAgfSwKICAgICJibGFjayI6IHsKICAgICAgInR5cGUiOiAiY29sb3IiLAogICAgICAibmFtZSI6ICJibGFjayIsCiAgICAgICJ2YWx1ZSI6ICIjMDAwMDAwIgogICAgfQogIH0sCiAgIiR0aGVtZXMiOiBbCiAgICB7CiAgICAgICJpZCI6ICJsaWdodCIsCiAgICAgICJuYW1lIjogIkxpZ2h0IiwKICAgICAgInNlbGVjdGVkVG9rZW5TZXRzIjogewogICAgICAgICJnbG9iYWwiOiAiZW5hYmxlZCIKICAgICAgfQogICAgfQogIF0KfQ==',
      },
    })
  ));
};

const withLicense = () => {
  licenseKeyPropertyReadSpy.mockImplementation(() => Promise.resolve('abc-def-ghi'));
  validateLicenseSpy.mockImplementation(async () => ({
    plan: 'pro',
    entitlements: [Entitlements.PRO],
    email: 'domain@example.com',
  }));
};

const withOrWithoutLicense = (
  params: Omit<StartupMessage, 'licenseKey'>,
  fn: (parmas: StartupMessage) => Promise<void>,
) => async () => {
  await fn({
    ...params,
    licenseKey: null,
  });

  resetSuite();
  withLicense();
  await fn({
    ...params,
    licenseKey: 'license-key',
  });
};
// #endregion

jest.mock('launchdarkly-react-client-sdk', () => ({
  LDProvider: (props: React.PropsWithChildren<unknown>) => props.children,
  useLDClient: () => ({
    identify: () => Promise.resolve(),
  }),
  useFlags: () => ({}),
}));

describe('AppContainer (integration)', () => {
  beforeEach(resetSuite);

  afterAll(() => {
    resetSuite();
  });

  it(
    'shows the start screen in a blank file', (
      withOrWithoutLicense({
        ...mockStartupParams,
        localTokenData: null,
        lastOpened: 1,
      }, async (params) => {
        await act(async () => {
          const mockStore = createMockStore({});
          const result = render(
            <Provider store={mockStore}>
              <AppContainer {...params} />
            </Provider>,
          );
          expect(await result.findByText('Getting started')).not.toBeUndefined();
          result.unmount();
        });
      })
    ),
  );

  it(
    'shows the onboarding flow modal', (
      withOrWithoutLicense({
        ...mockStartupParams,
        localTokenData: null,
        lastOpened: 0,
      }, async (params) => {
        await act(async () => {
          const mockStore = createMockStore({});
          const result = render(
            <Provider store={mockStore}>
              <AppContainer {...params} />
            </Provider>,
          );
          expect(await result.findByText('Getting started')).not.toBeUndefined();
          result.unmount();
        });
      })
    ),
  );

  it(
    'shows the tokens screen if local tokens are found', (
      withOrWithoutLicense({
        ...mockStartupParams,
        localTokenData: {
          ...mockStartupParams.localTokenData,
          checkForChanges: false,
          values: mockValues,
        } as StartupMessage['localTokenData'],
      }, async (params) => {
        const mockStore = createMockStore({});

        await act(async () => {
          const result = render(
            <Provider store={mockStore}>
              <AppContainer {...params} />
            </Provider>,
          );

          expect(await result.findAllByText('global')).toHaveLength(2);
          result.unmount();
        });
      })
    ),
  );

  it('shows pull dialog if there are local changes with a remote storage provider', withOrWithoutLicense({
    ...mockStartupParams,
    localApiProviders: mockGithubApiProviders,
    storageType: mockGithubStoragetype,
    user: mockUser,
    localTokenData: {
      ...mockStartupParams.localTokenData,
      values: mockValues,
    } as StartupMessage['localTokenData'],
  }, async (params) => {
    const mockStore = createMockStore({});

    await act(async () => {
      const result = render(
        <Provider store={mockStore}>
          <AppContainer {...params} />
        </Provider>,
      );

      await waitFor(async () => {
        expect(screen.queryByText(/Recover local changes\?/i)).not.toBeNull();
      }, {
        timeout: 5000,
      });

      result.unmount();
    });
  }));

  it('skips start page if there are no local changes and the Github provider can sync', withOrWithoutLicense({
    ...mockStartupParams,
    localApiProviders: mockGithubApiProviders,
    storageType: mockGithubStoragetype,
    user: mockUser,
    localTokenData: {
      ...mockStartupParams.localTokenData,
      checkForChanges: false,
      themes: mockThemes,
      values: mockValues,
    } as StartupMessage['localTokenData'],
  }, async (params) => {
    mockGithubGetContent();

    const mockStore = createMockStore({});

    await act(async () => {
      const result = render(
        <Provider store={mockStore}>
          <AppContainer {...params} />
        </Provider>,
      );

      expect(await result.findAllByText('global')).toHaveLength(2);

      result.unmount();
    });
  }));

  it('can switch to a different tokenset', withOrWithoutLicense({
    ...mockStartupParams,
    localTokenData: {
      ...mockStartupParams.localTokenData,
      checkForChanges: false,
      themes: mockThemes,
      values: mockValues,
    } as StartupMessage['localTokenData'],
  }, async (params) => {
    const mockStore = createMockStore({});

    await act(async () => {
      const result = render(
        <Provider store={mockStore}>
          <AppContainer {...params} />
        </Provider>,
      );

      (await result.findByTestId('tokensetitem-playground'))?.click();
      expect(mockStore.getState().tokenState.activeTokenSet).toEqual('playground');
      result.unmount();
    });
  }));

  it('can toggle a tokenset', withOrWithoutLicense({
    ...mockStartupParams,
    localTokenData: {
      ...mockStartupParams.localTokenData,
      checkForChanges: false,
      values: mockValues,
    } as StartupMessage['localTokenData'],
  }, async (params) => {
    const mockStore = createMockStore({});

    await act(async () => {
      const result = render(
        <Provider store={mockStore}>
          <AppContainer {...params} />
        </Provider>,
      );

      const checkbox = await result.findByTestId('tokensetitem-playground-checkbox');
      fireEvent.click(checkbox);

      expect(mockStore.getState().tokenState.usedTokenSet).toEqual({
        global: TokenSetStatus.DISABLED,
        playground: TokenSetStatus.ENABLED,
      });

      result.unmount();
    });
  }));

  it('shows the remote storage callout', withOrWithoutLicense({
    ...mockStartupParams,
    localTokenData: {
      ...mockStartupParams.localTokenData!,
      checkForChanges: false,
    },
    storageType: {
      provider: StorageProviderType.GITHUB,
      branch: 'main',
      filePath: 'data/tokens.json',
      id: 'github',
      internalId: 'github',
      name: 'Github',
    },
  }, async (params) => {
    const mockStore = createMockStore({});

    await act(async () => {
      const result = render(
        <Provider store={mockStore}>
          <AppContainer {...params} />
        </Provider>,
      );
      await result.findByText("Couldn't load tokens stored on GitHub");
      expect(result.queryByText("Couldn't load tokens stored on GitHub")).toBeInTheDocument();
    });
  }));
});

import '../../plugin/controller';
import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import App from './App';
import { mockGetContent } from '../../../tests/__mocks__/octokitRestMock';
import { render, resetStore } from '../../../tests/config/setupTest';
import { TokenTypes } from '@/constants/TokenTypes';
import {
  ApiProvidersProperty,
  CheckForChangesProperty,
  StorageTypeProperty,
  ThemesProperty,
  ValuesProperty,
  LicenseKeyProperty,
} from '@/figmaStorage';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import * as validateLicenseModule from '@/utils/validateLicense';
import { Entitlements } from '../store/models/userState';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessages, AsyncMessageTypes } from '@/types/AsyncMessages';
import { store } from '../store';

const storageTypePropertyReadSpy = jest.spyOn(StorageTypeProperty, 'read');
const apiProvidersPropertyReadSpy = jest.spyOn(ApiProvidersProperty, 'read');
const valuesPropertyReadSpy = jest.spyOn(ValuesProperty, 'read');
const themesPropertyReadSpy = jest.spyOn(ThemesProperty, 'read');
const checkForChangesPropertyReadSpy = jest.spyOn(CheckForChangesProperty, 'read');
const licenseKeyPropertyReadSpy = jest.spyOn(LicenseKeyProperty, 'read');
const validateLicenseSpy = jest.spyOn(validateLicenseModule, 'default');

const resetSuite = () => {
  storageTypePropertyReadSpy.mockReset();
  apiProvidersPropertyReadSpy.mockReset();
  valuesPropertyReadSpy.mockReset();
  themesPropertyReadSpy.mockReset();
  checkForChangesPropertyReadSpy.mockReset();
  licenseKeyPropertyReadSpy.mockReset();
  validateLicenseSpy.mockReset();
  resetStore();
};

const withMockValues = () => {
  valuesPropertyReadSpy.mockImplementation(async () => ({
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
    ],
    playground: [
      {
        type: TokenTypes.COLOR,
        value: '#ff0000',
        name: 'red',
      },
    ],
  }));
};

const withMockThemes = () => {
  themesPropertyReadSpy.mockImplementation(async () => ([
    {
      id: 'light',
      name: 'Light',
      selectedTokenSets: {
        global: TokenSetStatus.ENABLED,
      },
    },
  ]));
};

const withGithubStorageProvider = (checkForChanges = true) => {
  checkForChangesPropertyReadSpy.mockImplementation(async () => checkForChanges);
  storageTypePropertyReadSpy.mockImplementation(async () => ({
    provider: StorageProviderType.GITHUB,
    id: 'github',
    internalId: 'github',
    name: 'Github',
    branch: 'main',
    filePath: 'data/tokens.json',
  }));
  apiProvidersPropertyReadSpy.mockImplementation(async () => ([
    {
      provider: StorageProviderType.GITHUB,
      id: 'github',
      internalId: 'github',
      name: 'Github',
      branch: 'main',
      filePath: 'data/tokens.json',
      secret: 'github-secret',
    },
  ]));

  mockGetContent.mockImplementation(() => (
    Promise.resolve({
      data: {
        content: 'ewogICJnbG9iYWwiOiB7CiAgICAicmVkIjogewogICAgICAidHlwZSI6ICJjb2xvciIsCiAgICAgICJuYW1lIjogInJlZCIsCiAgICAgICJ2YWx1ZSI6ICIjZmYwMDAwIgogICAgfSwKICAgICJibGFjayI6IHsKICAgICAgInR5cGUiOiAiY29sb3IiLAogICAgICAibmFtZSI6ICJibGFjayIsCiAgICAgICJ2YWx1ZSI6ICIjMDAwMDAwIgogICAgfQogIH0sCiAgIiR0aGVtZXMiOiBbCiAgICB7CiAgICAgICJpZCI6ICJsaWdodCIsCiAgICAgICJuYW1lIjogIkxpZ2h0IiwKICAgICAgInNlbGVjdGVkVG9rZW5TZXRzIjogewogICAgICAgICJnbG9iYWwiOiAiZW5hYmxlZCIKICAgICAgfQogICAgfQogIF0KfQ==',
      },
    })
  ));
};

const withGithubStorageProviderWithInvalidTokens = (checkForChanges = true) => {
  checkForChangesPropertyReadSpy.mockImplementation(async () => checkForChanges);
  storageTypePropertyReadSpy.mockImplementation(async () => ({
    provider: StorageProviderType.GITHUB,
    id: 'github',
    internalId: 'github',
    name: 'Github',
    branch: 'main',
    filePath: 'data/tokens.json',
  }));
  apiProvidersPropertyReadSpy.mockImplementation(async () => ([
    {
      provider: StorageProviderType.GITHUB,
      id: 'github',
      internalId: 'github',
      name: 'Github',
      branch: 'main',
      filePath: 'data/tokens.json',
      secret: 'github-secret',
    },
  ]));

  mockGetContent.mockImplementation(() => (
    Promise.resolve({
      data: {
        content: 'RW1wdHkgZmlsZQ==',
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

const waitForChangedTabs = () => new Promise<void>((resolve) => {
  const unsubscribe = AsyncMessageChannel.ReactInstance.attachMessageListener(({ message }: { message?: AsyncMessages }) => {
    if (message?.type === AsyncMessageTypes.CHANGED_TABS) {
      unsubscribe();
      resolve();
    }
  });
});

const withOrWithoutLicense = (fn: () => Promise<void>) => async () => {
  await fn();

  resetSuite();
  withLicense();
  await fn();
};

describe('App', () => {
  jest.setTimeout(10000);

  beforeEach(resetSuite);

  it('shows the start screen in a blank file', withOrWithoutLicense(async () => {
    const result = render(<App />);
    expect(await result.findByText('Get started')).not.toBeUndefined();
    result.unmount();
  }));

  it('shows the tokens screen if local tokens are found', withOrWithoutLicense(async () => {
    withMockValues();

    const waitForChangedTabsPromise = waitForChangedTabs();
    const result = render(<App />);
    await waitForChangedTabsPromise;
    expect(result.queryAllByText('global')).toHaveLength(2);

    result.unmount();
  }));

  it('shows pull dialog if there are local changes with a remote storage provider', withOrWithoutLicense(async () => {
    withGithubStorageProvider();
    withMockValues();

    const result = render(<App />);
    await waitFor(async () => (
      expect(await screen.queryByText(/Recover local changes?/i)).not.toBeNull()
    ), {
      timeout: 5000,
    });

    result.unmount();
  }));

  it('shows the start screen if there are invalid tokens', withOrWithoutLicense(async () => {
    withGithubStorageProviderWithInvalidTokens(false);
    withMockValues();
    withMockThemes();

    const waitForChangedTabsPromise = waitForChangedTabs();
    const result = render(<App />);
    await waitForChangedTabsPromise;
    await waitFor(async () => (
      expect(await result.queryByText('Loading, please wait.')).toBeNull()
    ), {
      timeout: 5000,
    });
    expect(await result.findByText('Get started')).not.toBeUndefined();
    result.unmount();
  }));

  it('skips start page if there are no local changes and the Github provider can sync', withOrWithoutLicense(async () => {
    withGithubStorageProvider(false);
    withMockValues();
    withMockThemes();

    const result = render(<App />);
    await waitFor(async () => (
      expect(await result.queryByText('Loading, please wait.')).toBeNull()
    ), {
      timeout: 5000,
    });

    expect(await result.findAllByText('global')).toHaveLength(2);

    result.unmount();
  }));

  it('can switch to a different tokenset', withOrWithoutLicense(async () => {
    withMockValues();
    withMockThemes();

    const waitForChangedTabsPromise = waitForChangedTabs();
    const result = render(<App />);
    await waitForChangedTabsPromise;
    (await result.findByTestId('tokensetitem-playground'))?.click();
    expect(store.getState().tokenState.activeTokenSet).toEqual('playground');
    result.unmount();
  }));

  it('can toggle a tokenset', withOrWithoutLicense(async () => {
    withMockValues();

    const waitForChangedTabsPromise = waitForChangedTabs();
    const result = render(<App />);
    await waitForChangedTabsPromise;
    const checkbox = await result.findByTestId('tokensetitem-playground-checkbox');
    fireEvent.click(checkbox);

    expect(store.getState().tokenState.usedTokenSet).toEqual({
      global: TokenSetStatus.DISABLED,
      playground: TokenSetStatus.ENABLED,
    });

    result.unmount();
  }));
});

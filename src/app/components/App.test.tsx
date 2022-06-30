import '../../plugin/controller';
import React from 'react';
import { screen, waitFor } from '@testing-library/react';
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

const storageTypePropertyReadSpy = jest.spyOn(StorageTypeProperty, 'read');
const apiProvidersPropertyReadSpy = jest.spyOn(ApiProvidersProperty, 'read');
const valuesPropertyReadSpy = jest.spyOn(ValuesProperty, 'read');
const themesPropertyReadSpy = jest.spyOn(ThemesProperty, 'read');
const checkForChangesPropertyReadSpy = jest.spyOn(CheckForChangesProperty, 'read');
const licenseKeyPropertyReadSpy = jest.spyOn(LicenseKeyProperty, 'read');
const validateLicenseSpy = jest.spyOn(validateLicenseModule, 'default');

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

const withLicense = () => {
  licenseKeyPropertyReadSpy.mockImplementation(() => Promise.resolve('abc-def-ghi'));
  validateLicenseSpy.mockImplementation(async () => ({
    plan: 'pro',
    entitlements: [Entitlements.PRO],
    email: 'domain@example.com',
  }));
};

const withOrWithoutLicense = (fn: () => Promise<void>) => async () => {
  await fn();

  withLicense();
  await fn();
};

describe('App', () => {
  jest.setTimeout(10000);

  beforeEach(() => {
    jest.clearAllMocks();
    resetStore();
  });

  it('shows the start screen in a blank file', withOrWithoutLicense(async () => {
    const result = render(<App />);
    expect(await result.findByText('Get started')).not.toBeUndefined();
    result.unmount();
  }));

  it('shows the tokens screen if local tokens are found', withOrWithoutLicense(async () => {
    withMockValues();

    const result = render(<App />);
    await waitFor(async () => (
      expect(await result.queryByText('Loading, please wait.')).toBeNull()
    ), {
      timeout: 5000,
    });

    expect(await result.queryAllByText('global')).toHaveLength(2);

    result.unmount();
  }));

  it('shows pull dialog if there are local changes with a remote storage provider', withOrWithoutLicense(async () => {
    withGithubStorageProvider();
    withMockValues();

    const result = render(<App />);
    await waitFor(async () => (
      expect(await screen.queryByText(/Pull from Github/i)).not.toBeNull()
    ), {
      timeout: 5000,
    });

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
});

import '../../plugin/controller';
import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import App from './App';
import { mockGetContent } from '../../../tests/__mocks__/octokitRestMock';
import { render, resetStore } from '../../../tests/config/setupTest';
import { TokenTypes } from '@/constants/TokenTypes';
import {
  ApiProvidersProperty, CheckForChangesProperty, StorageTypeProperty, ThemesProperty, ValuesProperty,
} from '@/figmaStorage';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { TokenSetStatus } from '@/constants/TokenSetStatus';

const storageTypePropertyReadSpy = jest.spyOn(StorageTypeProperty, 'read');
const apiProvidersPropertyReadSpy = jest.spyOn(ApiProvidersProperty, 'read');
const valuesPropertyReadSpy = jest.spyOn(ValuesProperty, 'read');
const themesPropertyReadSpy = jest.spyOn(ThemesProperty, 'read');
const checkForChangesPropertyReadSpy = jest.spyOn(CheckForChangesProperty, 'read');

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

  mockGetContent.mockImplementationOnce(() => (
    Promise.resolve({
      data: {
        content: 'ewogICJnbG9iYWwiOiB7CiAgICAicmVkIjogewogICAgICAidHlwZSI6ICJjb2xvciIsCiAgICAgICJuYW1lIjogInJlZCIsCiAgICAgICJ2YWx1ZSI6ICIjZmYwMDAwIgogICAgfSwKICAgICJibGFjayI6IHsKICAgICAgInR5cGUiOiAiY29sb3IiLAogICAgICAibmFtZSI6ICJibGFjayIsCiAgICAgICJ2YWx1ZSI6ICIjMDAwMDAwIgogICAgfQogIH0sCiAgIiR0aGVtZXMiOiBbCiAgICB7CiAgICAgICJpZCI6ICJsaWdodCIsCiAgICAgICJuYW1lIjogIkxpZ2h0IiwKICAgICAgInNlbGVjdGVkVG9rZW5TZXRzIjogewogICAgICAgICJnbG9iYWwiOiAiZW5hYmxlZCIKICAgICAgfQogICAgfQogIF0KfQ==',
      },
    })
  ));
};

describe('App', () => {
  jest.setTimeout(10000);

  beforeEach(() => {
    jest.clearAllMocks();
    resetStore();
  });

  it('shows the start screen in a blank file', async () => {
    const result = render(<App />);
    expect(await result.findByText('Get started')).not.toBeUndefined();
  });

  it('shows the tokens screen if local tokens are found', async () => {
    withMockValues();

    const result = render(<App />);
    await waitFor(async () => (
      expect(await result.queryByText('Loading, please wait.')).toBeNull()
    ), {
      timeout: 5000,
    });

    expect(await result.queryAllByText('global')).toHaveLength(2);
  });

  it('shows pull dialog if there are local changes with a remote storage provider', async () => {
    withGithubStorageProvider();
    withMockValues();

    render(<App />);
    await waitFor(async () => (
      expect(await screen.queryByText(/Pull from Github/i)).not.toBeNull()
    ), {
      timeout: 5000,
    });
  });

  it('skips start page if there are no local changes and the Github provider can sync', async () => {
    withGithubStorageProvider(false);
    withMockValues();
    withMockThemes();

    const result = render(<App />);
    await waitFor(async () => (
      expect(await result.queryByText('Loading, please wait.')).toBeNull()
    ), {
      timeout: 5000,
    });

    expect(await result.queryAllByText('global')).toHaveLength(2);
  });
});

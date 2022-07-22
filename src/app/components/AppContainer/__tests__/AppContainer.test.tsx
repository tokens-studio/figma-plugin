import React from 'react';
import { Provider } from 'react-redux';
import type { StartupMessage } from '@/types/AsyncMessages';
import { act, createMockStore, render } from '../../../../../tests/config/setupTest';
import { AppContainer } from '../AppContainer';
import * as savePluginDataFactoryModule from '../startupProcessSteps/savePluginDataFactory';
import * as addLicenseFactoryModule from '../startupProcessSteps/addLicenseFactory';
import * as getLdFlagsFactorySpyModule from '../startupProcessSteps/getLdFlagsFactory';
import * as saveStorageInforamationFactoryModule from '../startupProcessSteps/saveStorageInforamationFactory';
import * as pullTokensFactoryModule from '../startupProcessSteps/pullTokensFactory';

const savePluginDataFactorySpy = jest.spyOn(savePluginDataFactoryModule, 'savePluginDataFactory');
const addLicenseFactorySpy = jest.spyOn(addLicenseFactoryModule, 'addLicenseFactory');
const getLdFlagsFactorySpy = jest.spyOn(getLdFlagsFactorySpyModule, 'getLdFlagsFactory');
const saveStorageInforamationFactorySpy = jest.spyOn(saveStorageInforamationFactoryModule, 'saveStorageInforamationFactory');
const pullTokensFactorySpy = jest.spyOn(pullTokensFactoryModule, 'pullTokensFactory');

describe('AppContainer', () => {
  beforeAll(() => {
    savePluginDataFactorySpy.mockImplementation(() => (
      () => Promise.resolve()
    ));
    addLicenseFactorySpy.mockImplementation(() => (
      () => Promise.resolve()
    ));
    getLdFlagsFactorySpy.mockImplementation(() => (
      () => Promise.resolve()
    ));
    saveStorageInforamationFactorySpy.mockImplementation(() => (
      () => Promise.resolve()
    ));
    pullTokensFactorySpy.mockImplementation(() => (
      () => Promise.resolve()
    ));
  });

  afterAll(() => {
    savePluginDataFactorySpy.mockReset();
    addLicenseFactorySpy.mockReset();
    getLdFlagsFactorySpy.mockReset();
    saveStorageInforamationFactorySpy.mockReset();
    pullTokensFactorySpy.mockReset();
  });

  it('should work', async () => {
    const mockStore = createMockStore({});

    await act(async () => {
      const result = render(
        <Provider store={mockStore}>
          <AppContainer {...({} as unknown as StartupMessage)} />
        </Provider>,
      );

      expect(result.queryByText('Loading, please wait.')).not.toBeNull();
      expect(savePluginDataFactorySpy).toBeCalledTimes(1);
      expect(addLicenseFactorySpy).toBeCalledTimes(1);
      expect(getLdFlagsFactorySpy).toBeCalledTimes(1);
      expect(saveStorageInforamationFactorySpy).toBeCalledTimes(1);
      expect(pullTokensFactorySpy).toBeCalledTimes(1);
    });
  });
});

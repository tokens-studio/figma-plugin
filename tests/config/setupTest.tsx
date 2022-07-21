/* eslint-disable react/jsx-props-no-spreading */
import 'whatwg-fetch';
import '@testing-library/jest-dom/extend-expect';
import React, { FC, ReactElement } from 'react';
import dotenv from 'dotenv';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { init } from '@rematch/core';
import { server } from '../../src/mocks/server';
import { RootState, store } from '../../src/app/store';
import { models } from '../../src/app/store/models';
import { undoableEnhancer } from '@/app/enhancers/undoableEnhancer';

export const AllTheProviders: FC = ({ children }) => (
  <Provider store={store}>
    {children}
  </Provider>
);

const resetStore = () => {
  store.dispatch({ type: 'RESET_APP' });
};

export const createMockStore = (
  initialState: Partial<{
    [K in keyof RootState]: Partial<RootState[K]>
  }>,
) => {
  const storeModels = { ...models };
  Object.entries(initialState).forEach(([name, value]) => {
    const key = name as keyof RootState;
    storeModels[key] = {
      ...storeModels[key],
      state: {
        ...storeModels[key].state,
        ...value,
      },
    } as any; // this is only for mock purposes so we don't need to worry too much here
  });

  return init({
    models: storeModels,
    redux: {
      devtoolOptions: {},
      enhancers: [undoableEnhancer],
      rootReducers: {
        RESET_APP: () => undefined,
      },
    },
  });
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'queries' | 'providerProps'>) => render(ui, { wrapper: AllTheProviders, ...options });

// msw setup
beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

dotenv.config({ });

export * from '@testing-library/react';

export { customRender as render, resetStore };

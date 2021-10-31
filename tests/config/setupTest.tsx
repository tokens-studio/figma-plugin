/* eslint-disable react/jsx-props-no-spreading */
import React, {FC, ReactElement} from 'react';
import {render, RenderOptions} from '@testing-library/react';
import {Provider} from 'react-redux';
import '@testing-library/jest-dom/extend-expect';
import {store} from '../../src/app/store';

const AllTheProviders: FC = ({children, options}) => {
    return (
        <Provider store={store} {...options}>
            {children}
        </Provider>
    );
};

const resetStore = () => {
    store.dispatch({type: 'RESET_APP'});
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'queries', 'providerProps'>) =>
    render(ui, {wrapper: AllTheProviders, ...options});

export * from '@testing-library/react';

export {customRender as render, resetStore};

/* eslint-disable react/jsx-props-no-spreading */
import React, {FC, ReactElement} from 'react';
import {render, RenderOptions} from '@testing-library/react';
import {TokenProvider} from '../../src/app/store/TokenContext';
import '@testing-library/jest-dom/extend-expect';

const AllTheProviders: FC = ({children, options}) => {
    return <TokenProvider {...options}>{children}</TokenProvider>;
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'queries', 'providerProps'>) =>
    render(ui, {wrapper: AllTheProviders, ...options});

export * from '@testing-library/react';

export {customRender as render};

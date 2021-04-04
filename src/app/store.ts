import {init, RematchDispatch, RematchRootState} from '@rematch/core';
import {models, RootModel} from './store/models';

export const store = init({
    models,
});

export type Store = typeof store;
export type Dispatch = RematchDispatch<RootModel>;
export type RootState = RematchRootState<RootModel>;

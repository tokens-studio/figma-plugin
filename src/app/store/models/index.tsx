import {Models} from '@rematch/core';
import {settings} from './settings';
import {uiState} from './uiState';

export interface RootModel extends Models<RootModel> {
    settings: typeof settings;
    uiState: typeof uiState;
}

export const models: RootModel = {settings, uiState};

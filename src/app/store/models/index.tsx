import {Models} from '@rematch/core';
import {settings} from './settings';
import {base} from './base';
import {uiState} from './uiState';

export interface RootModel extends Models<RootModel> {
    settings: typeof settings;
    base: typeof base;
    uiState: typeof uiState;
}

export const models: RootModel = {settings, base, uiState};

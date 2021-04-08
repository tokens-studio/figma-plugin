import {Models} from '@rematch/core';
import {settings} from './settings';
import {base} from './base';

export interface RootModel extends Models<RootModel> {
    settings: typeof settings;
    base: typeof base;
}

export const models: RootModel = {settings, base};

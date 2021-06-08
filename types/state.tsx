import TokenData from '../src/app/components/TokenData';
import {ApiDataType, StorageType} from './api';
import {Tokens} from './tokens';

export type StateType = {
    storageType: StorageType;
    tokens: Tokens;
    loading: boolean;
    disabled: boolean;
    collapsed: boolean;
    tokenData: TokenData;
    selectionValues: object;
    showEditForm: boolean;
    showOptions: boolean | string;
    api: ApiDataType;
    apiProviders: ApiDataType[];
    updatePageOnly: boolean;
    editProhibited: boolean;
    usedTokenSet: string[];
};

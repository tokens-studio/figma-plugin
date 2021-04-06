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
    displayType: 'GRID' | 'LIST';
    colorMode: boolean;
    showEditForm: boolean;
    showOptions: boolean;
    api: ApiDataType;
    apiProviders: ApiDataType[];
    updatePageOnly: boolean;
    editProhibited: boolean;
    usedTokenSet: string[];
};

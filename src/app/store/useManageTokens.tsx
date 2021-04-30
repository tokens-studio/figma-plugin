import {useDispatch, useSelector} from 'react-redux';
import {SingleToken, SingleTokenObject, TokenGroup, TokenType} from '@types/tokens';
import {StorageProviderType} from '@types/api';
import React from 'react';
import useRemoteTokens from './remoteTokens';
import {Dispatch, RootState} from '../store';

export default function useManageTokens() {
    const {editToken, createToken, deleteToken} = useDispatch<Dispatch>().tokenState;
    const {storageType} = useSelector((state: RootState) => state.uiState);
    const {uiWindow} = useSelector((state: RootState) => state.settings);
    const {activeTokenSet, tokens} = useSelector((state: RootState) => state.tokenState);
    const dispatch = useDispatch<Dispatch>();

    const {editRemoteToken, createRemoteToken, deleteRemoteToken} = useRemoteTokens();

    async function editSingleToken(data: {
        parent: string;
        name: string;
        value: SingleToken;
        options?: {description?: string; type: TokenType};
        oldName?: string;
    }) {
        const {parent, name, value, options, oldName} = data;
        dispatch.uiState.setLoading(true);
        const isLocal = storageType.provider === StorageProviderType.LOCAL;
        let shouldUpdate = true;
        if (!isLocal) {
            shouldUpdate = await editRemoteToken(data);
        }
        if (shouldUpdate) {
            editToken({
                parent,
                name,
                value,
                options,
                oldName,
            });
        }
        dispatch.uiState.setLoading(false);
    }

    async function createSingleToken(data: {
        parent: string;
        name: string;
        value: SingleToken;
        options?: {description?: string; type: TokenType};
        newGroup?: boolean;
    }) {
        const {parent, name, value, options, newGroup = false} = data;
        dispatch.uiState.setLoading(true);
        const isLocal = storageType.provider === StorageProviderType.LOCAL;
        let shouldUpdate = true;
        if (!isLocal) {
            shouldUpdate = await createRemoteToken(data);
        }
        if (shouldUpdate) {
            createToken({
                parent,
                name,
                value,
                options,
                newGroup,
            });
        }
        dispatch.uiState.setLoading(false);
    }

    async function deleteSingleToken(data) {
        console.log('storage type is', storageType);
        dispatch.uiState.setLoading(true);
        const isLocal = storageType.provider === StorageProviderType.LOCAL;
        if (!isLocal) {
            const response = await deleteRemoteToken(data);
        }
        deleteToken(data);
        dispatch.uiState.setLoading(false);
    }

    return {editSingleToken, createSingleToken, deleteSingleToken};
}

import {SingleToken, TokenType} from '../../../types/tokens';
import {StorageProviderType} from '../../../types/api';
import useRemoteTokens from './remoteTokens';
import {useTokenDispatch, useTokenState} from './TokenContext';

export default function useManageTokens() {
    const {storageType} = useTokenState();
    const {setLoading, updateTokens, editToken, deleteToken, createToken} = useTokenDispatch();
    const {editRemoteToken, createRemoteToken, deleteRemoteToken} = useRemoteTokens();

    async function editSingleToken(data: {
        parent: string;
        name: string;
        value: SingleToken;
        options?: {description?: string; type: TokenType};
        oldName?: string;
    }) {
        const {parent, name, value, options, oldName} = data;
        setLoading(true);
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

        updateTokens(isLocal);
        setLoading(false);
    }

    async function createSingleToken(data: {
        parent: string;
        name: string;
        value: SingleToken;
        options?: {description?: string; type: TokenType};
        newGroup?: boolean;
    }) {
        const {parent, name, value, options, newGroup = false} = data;
        setLoading(true);
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

        updateTokens(isLocal);
        setLoading(false);
    }

    async function deleteSingleToken(data) {
        setLoading(true);
        const isLocal = storageType.provider === StorageProviderType.LOCAL;
        if (!isLocal) {
            const response = await deleteRemoteToken(data);
        }
        deleteToken(data);
        setLoading(false);
    }

    return {editSingleToken, createSingleToken, deleteSingleToken};
}

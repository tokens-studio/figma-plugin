import {SingleToken} from '../../../types/tokens';
import {StorageProviderType} from '../../../types/api';
import useRemoteTokens from './remoteTokens';
import {useTokenDispatch, useTokenState} from './TokenContext';

export default function useManageTokens() {
    const {storageType} = useTokenState();
    const {setLoading, updateTokens, updateSingleToken, deleteToken} = useTokenDispatch();
    const {editRemoteToken, createRemoteToken, deleteRemoteToken} = useRemoteTokens();

    async function editSingleToken(data: {
        parent: string;
        name: string;
        value: SingleToken;
        options?: object;
        oldName?: string;
    }) {
        const {parent, name, value, options, oldName} = data;
        setLoading(true);
        const isLocal = storageType.provider === StorageProviderType.LOCAL;
        if (!isLocal) {
            const response = await editRemoteToken(data);
            console.log('done editing', response);
        }
        console.log('Old name was', oldName, typeof oldName);
        updateSingleToken({
            parent,
            name,
            value,
            options,
            oldName,
        });
        updateTokens();
        setLoading(false);
    }

    async function createSingleToken(data: {
        parent: string;
        name: string;
        value: SingleToken;
        options?: object;
        newGroup?: boolean;
    }) {
        const {parent, name, value, options, newGroup = false} = data;
        setLoading(true);
        const isLocal = storageType.provider === StorageProviderType.LOCAL;
        if (!isLocal) {
            const response = await createRemoteToken(data);
            console.log('done editing', response);
        }
        updateSingleToken({
            parent,
            name,
            value,
            options,
            newGroup,
        });
        updateTokens();
        setLoading(false);
    }

    async function deleteSingleToken(data) {
        setLoading(true);
        const isLocal = storageType.provider === StorageProviderType.LOCAL;
        if (!isLocal) {
            const response = await deleteRemoteToken(data);
            console.log('done editing', response);
        }
        deleteToken(data);
        setLoading(false);
    }

    return {editSingleToken, createSingleToken, deleteSingleToken};
}

import {postToFigma} from '@/plugin/notifiers';
import {useDispatch} from 'react-redux';
import {StorageType} from 'Types/api';
import {MessageToPluginTypes} from 'Types/messages';
import {Dispatch} from '../store';

export default function useStorage() {
    const dispatch = useDispatch<Dispatch>();

    function setStorageType({provider, bool = false}: {provider: StorageType; bool?: boolean}) {
        if (bool) {
            postToFigma({
                type: MessageToPluginTypes.SET_STORAGE_TYPE,
                storageType: provider,
            });
        }
        dispatch.uiState.setStorage(provider);
    }

    return {setStorageType};
}

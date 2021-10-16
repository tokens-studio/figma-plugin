import {useDispatch} from 'react-redux';
import {Dispatch} from '@/app/store';
import {StorageProviderType} from 'Types/api';
import {MessageToPluginTypes} from 'Types/messages';
import {TokenProps} from 'Types/tokens';
import {notifyToUI, postToFigma} from '../../../plugin/notifiers';

async function readTokensFromURL({secret, id}): Promise<TokenProps> | null {
    const response = await fetch(id, {
        method: 'GET',
        headers: {
            Authorization: secret,
            Accept: 'application/json',
        },
    });

    if (response.ok) {
        const data = await response.json();
        return data;
    }
    notifyToUI('There was an error connecting, check your sync settings');
    return null;
}

export default function useURL() {
    const dispatch = useDispatch<Dispatch>();

    // Read tokens from URL
    async function pullTokensFromURL(context): Promise<TokenProps> | null {
        const {id, secret, name} = context;

        if (!id && !secret) return;

        try {
            const data = await readTokensFromURL({id, secret});
            dispatch.uiState.setProjectURL(id);

            if (data) {
                postToFigma({
                    type: MessageToPluginTypes.CREDENTIALS,
                    id,
                    name,
                    secret,
                    provider: StorageProviderType.URL,
                });
                if (data) {
                    const tokenObj = {
                        values: data,
                    };
                    dispatch.tokenState.setTokenData(tokenObj);
                    dispatch.tokenState.setEditProhibited(true);
                    return tokenObj;
                }

                notifyToUI('No tokens stored on remote');
            }
        } catch (e) {
            notifyToUI('Error fetching from URL, check console (F12)');
            console.log('Error:', e);
        }
    }
    return {
        pullTokensFromURL,
    };
}

import {useDispatch} from 'react-redux';
import {Dispatch} from '@/app/store';
import {StorageProviderType} from 'Types/api';
import {MessageToPluginTypes} from 'Types/messages';
import {TokenProps} from 'Types/tokens';
import convertTokensToObject from '@/utils/convertTokensToObject';
import {notifyToUI, postToFigma} from '../../../plugin/notifiers';
import {compareUpdatedAt} from '../../components/utils';
import * as pjs from '../../../../package.json';
import useStorage from '../useStorage';

async function readTokensFromJSONBin({secret, id}): Promise<TokenProps> | null {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${id}/latest`, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': secret,
            'X-Bin-Meta': false,
        },
    });

    if (response.ok) {
        return response.json();
    }
    notifyToUI('There was an error connecting, check your sync settings');
    return null;
}

async function writeTokensToJSONBin({secret, id, tokenObj}): Promise<TokenProps> | null {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${id}`, {
        method: 'PUT',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        body: tokenObj,
        headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': secret,
        },
    });

    if (response.ok) {
        const res = await response.json();
        notifyToUI('Updated Remote');
        return res;
    }
    notifyToUI('Error updating remote');
    return null;
}

export async function updateJSONBinTokens({tokens, context, updatedAt, oldUpdatedAt = null}) {
    const {id, secret} = context;

    try {
        const tokenObj = JSON.stringify(
            {
                version: pjs.plugin_version,
                updatedAt,
                values: convertTokensToObject(tokens),
            },
            null,
            2
        );

        if (oldUpdatedAt) {
            const remoteTokens = await readTokensFromJSONBin({secret, id});
            const comparison = await compareUpdatedAt(oldUpdatedAt, remoteTokens.updatedAt);
            if (comparison === 'remote_older') {
                writeTokensToJSONBin({secret, id, tokenObj});
            } else {
                // Tell the user to choose between:
                // A) Pull Remote values and replace local changes
                // B) Overwrite Remote changes
                notifyToUI('Error updating tokens as remote is newer, please update first');
            }
        } else {
            writeTokensToJSONBin({secret, id, tokenObj});
        }
    } catch (e) {
        console.log('Error updating jsonbin', e);
    }
}

export function useJSONbin() {
    const dispatch = useDispatch<Dispatch>();
    const {setStorageType} = useStorage();

    async function createNewJSONBin(context): Promise<TokenProps> {
        const {secret, tokens, name, updatedAt} = context;
        const response = await fetch(`https://api.jsonbin.io/v3/b`, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            body: JSON.stringify({
                version: pjs.plugin_version,
                updatedAt,
                values: {
                    options: {},
                },
            }),
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': secret,
                'X-Bin-Name': name,
                versioning: 'false',
            },
        });
        if (response.ok) {
            const jsonBinData = await response.json();
            dispatch.uiState.setApiData({
                id: jsonBinData.metadata.id,
                name,
                secret,
                provider: StorageProviderType.JSONBIN,
            });
            setStorageType({
                provider: {id: jsonBinData.metadata.id, name, provider: StorageProviderType.JSONBIN},
                bool: true,
            });
            updateJSONBinTokens({
                tokens,
                id: jsonBinData.metadata.id,
                secret,
                updatedAt,
            });
            postToFigma({
                type: MessageToPluginTypes.CREDENTIALS,
                id: jsonBinData.metadata.id,
                name,
                secret,
                provider: StorageProviderType.JSONBIN,
            });
            return tokens;
        }
        notifyToUI('Something went wrong. See console for details');
        return null;
    }

    // Read tokens from JSONBin

    async function fetchDataFromJSONBin(context): Promise<TokenProps> {
        const {id, secret, name} = context;

        if (!id && !secret) return;

        try {
            const jsonBinData = await readTokensFromJSONBin({id, secret});
            dispatch.uiState.setProjectURL(`https://jsonbin.io/${id}`);

            if (jsonBinData) {
                postToFigma({
                    type: MessageToPluginTypes.CREDENTIALS,
                    id,
                    name,
                    secret,
                    provider: StorageProviderType.JSONBIN,
                });
                if (jsonBinData?.values) {
                    return {
                        version: jsonBinData.version,
                        updatedAt: jsonBinData.updatedAt,
                        values: jsonBinData.values,
                    };
                }
                notifyToUI('No tokens stored on remote');
            }

            return null;
        } catch (e) {
            notifyToUI('Error fetching from JSONbin, check console (F12)');
            console.log('Error:', e);
        }
    }
    return {
        fetchDataFromJSONBin,
        createNewJSONBin,
    };
}

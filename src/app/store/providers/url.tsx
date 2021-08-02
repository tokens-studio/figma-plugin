import {useDispatch} from 'react-redux';
import {Dispatch} from '@/app/store';
import {StorageProviderType} from 'Types/api';
import {MessageToPluginTypes} from 'Types/messages';
import {TokenProps} from 'Types/tokens';
import convertTokensToObject from '@/utils/convertTokensToObject';
import {notifyToUI, postToFigma} from '../../../plugin/notifiers';
import {compareUpdatedAt} from '../../components/utils';
import * as pjs from '../../../../package.json';

async function readTokensFromURL({secret, id}): Promise<TokenProps> | null {
    const response = await fetch(`https://api.github.com/${id}/git/contents/${filename}`, {
        method: 'GET',
        headers: {
            Authorization: secret,
            Accept: 'application/vnd.github.v3+json',
        },
    });

    if (response.ok) {
        const data = await response.json();
        const decoded = atob(data.content);
        const parsed = JSON.parse(decoded);
        return parsed;
    }
    notifyToUI('There was an error connecting, check your sync settings');
    return null;
}

async function writeTokensToURL({secret, id, tokenObj}): Promise<TokenProps> | null {
    const response = await fetch(`https://api.github.com/${id}/git/dispatches`, {
        method: 'POST',
        body: {
            message: 'Commit from Figma Tokens',
            content: tokenObj,
        },
        headers: {
            Authorization: secret,
            Accept: 'application/vnd.github.v3+json',
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

export async function updateURLTokens({tokens, id, secret, updatedAt, oldUpdatedAt = null}) {
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
            const remoteTokens = await readTokensFromURL({secret, id});
            const comparison = await compareUpdatedAt(oldUpdatedAt, remoteTokens.updatedAt);
            if (comparison === 'remote_older') {
                writeTokensToURL({secret, id, tokenObj});
            } else {
                // Tell the user to choose between:
                // A) Pull Remote values and replace local changes
                // B) Overwrite Remote changes
                notifyToUI('Error updating tokens as remote is newer, please update first');
            }
        } else {
            writeTokensToURL({secret, id, tokenObj});
        }
    } catch (e) {
        console.log('Error updating jsonbin', e);
    }
}

export function useURL() {
    const dispatch = useDispatch<Dispatch>();

    async function createNewURL({provider, secret, tokens, name, updatedAt}): Promise<TokenProps> {
        return null;
    }

    // Read tokens from JSONBin

    async function fetchDataFromURL(id, secret, name): Promise<TokenProps> {
        let tokenValues;

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
                console.log('Data values', data.values);
                if (data?.values) {
                    const obj = {
                        version: data.version,
                        updatedAt: data.updatedAt,
                        values: data.values,
                    };

                    tokenValues = obj;
                } else {
                    notifyToUI('No tokens stored on remote');
                }
            }

            return tokenValues;
        } catch (e) {
            notifyToUI('Error fetching from URL, check console (F12)');
            console.log('Error:', e);
        }
    }
    return {
        fetchDataFromURL,
        createNewURL,
    };
}

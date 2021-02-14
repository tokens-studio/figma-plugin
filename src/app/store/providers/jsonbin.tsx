import * as pjs from '../../../../package.json';
import {notifyToUI, postToFigma} from '../../../plugin/notifiers';
import {StorageProviderType} from '../../../types/api';
import {MessageToPluginTypes} from '../../../types/messages';
import {TokenProps} from '../../../types/tokens';
import {compareUpdatedAt} from '../../components/utils';

export async function readTokensFromJSONBin({secret, id}): Promise<TokenProps> | null {
    const response = await fetch(`https://api.jsonbin.io/b/${id}/latest`, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            'secret-key': secret,
        },
    });

    if (response) {
        return response.json();
    }
    notifyToUI('There was an error connecting, check your sync settings');
    return null;
}

export async function writeTokensToJSONBin({secret, id, tokenObj}): Promise<TokenProps> | null {
    const response = await fetch(`https://api.jsonbin.io/b/${id}`, {
        method: 'PUT',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        body: tokenObj,
        headers: {
            'Content-Type': 'application/json',
            'secret-key': secret,
        },
    });

    const res = await response.json();

    if (response.ok) {
        notifyToUI('Updated Remote');
        return res;
    }
    notifyToUI('Error updating remote');
    return null;
}

export async function updateJSONBinTokens({tokens, id, secret, updatedAt, oldUpdatedAt = null}) {
    const tokenObj = JSON.stringify(
        {
            version: pjs.version,
            updatedAt,
            values: {
                options: JSON.parse(tokens.options),
            },
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
            console.log('Not updating remote, add Modal asking user to choose how to handle this');
        }
    } else {
        writeTokensToJSONBin({secret, id, tokenObj});
    }
}

export async function createNewJSONBin({provider, secret, tokens, name, updatedAt, setApiData, setStorageType}) {
    const response = await fetch(`https://api.jsonbin.io/b`, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        body: JSON.stringify({
            version: pjs.version,
            updatedAt,
            values: {
                options: {},
            },
        }),
        headers: {
            'Content-Type': 'application/json',
            'secret-key': secret,
        },
    });
    const jsonBinData = await response.json();
    if (jsonBinData.success) {
        setApiData({id: jsonBinData.id, name, secret, provider});
        setStorageType({id: jsonBinData.id, name, provider}, true);
        updateJSONBinTokens({
            tokens,
            id: jsonBinData.id,
            secret,
            updatedAt,
        });
        postToFigma({
            type: MessageToPluginTypes.CREDENTIALS,
            id: jsonBinData.id,
            name,
            secret,
            provider,
        });
    }
}

// Read tokens from JSONBin

export async function fetchDataFromJSONBin(id, secret, name): Promise<TokenProps> {
    console.log('executing jsonbin', id, secret, name);
    let tokenValues;

    if (!id && !secret) return;

    const jsonBinData = await readTokensFromJSONBin({id, secret});

    if (jsonBinData) {
        postToFigma({
            type: MessageToPluginTypes.CREDENTIALS,
            id,
            name,
            secret,
            provider: StorageProviderType.JSONBIN,
        });
        console.log('data is', jsonBinData);
        if (jsonBinData?.values) {
            console.log('got options!');
            const obj = {
                version: jsonBinData.version,
                updatedAt: jsonBinData.updatedAt,
                values: {
                    options: JSON.stringify(jsonBinData.values.options, null, 2),
                },
            };

            tokenValues = obj;
        } else {
            notifyToUI('No tokens stored on remote');
        }
    }

    return tokenValues;
}

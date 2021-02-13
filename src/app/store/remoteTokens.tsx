import {TokenProps} from '../../types/tokens';
import {StorageProviderType} from '../../types/api';
import {postToFigma, notifyToUI} from '../../plugin/notifiers';
import * as pjs from '../../../package.json';
import {StateType} from '../../types/state';
import {MessageToPluginTypes} from '../../types/messages';

export async function compareUpdatedAt(oldUpdatedAt, newUpdatedAt) {
    if (newUpdatedAt > oldUpdatedAt) {
        return 'remote_newer';
    }
    if (newUpdatedAt === oldUpdatedAt) {
        return 'same';
    }
    return 'remote_older';
}

async function readTokensFromJSONBin({secret, id}): Promise<TokenProps> | null {
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

async function writeTokensToJSONBin({secret, id, tokenObj}): Promise<TokenProps> | null {
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

export async function updateRemoteTokens({
    tokens,
    id,
    secret,
    updatedAt,
    oldUpdatedAt,
}: {
    tokens: any;
    id: string;
    secret: string;
    updatedAt: string;
    oldUpdatedAt?: string;
}) {
    notifyToUI('Updating remote...');

    if (!id && !secret) return;

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

export async function createNewBin({secret, tokens, name, updatedAt, setApiData, setStorageType}) {
    notifyToUI('Creating new bin...');

    const provider = StorageProviderType.JSONBIN;
    const response = await fetch(`https://api.jsonbin.io/b`, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        body: '{"Empty": "Bin"}',
        headers: {
            'Content-Type': 'application/json',
            'secret-key': secret,
        },
    });
    const jsonBinData = await response.json();
    if (jsonBinData.success) {
        setApiData({id: jsonBinData.id, name, secret, provider});
        setStorageType({id: jsonBinData.id, name, provider}, true);
        updateRemoteTokens({tokens, id: jsonBinData.id, secret, updatedAt});
        postToFigma({
            type: MessageToPluginTypes.CREDENTIALS,
            id: jsonBinData.id,
            name,
            secret,
            provider,
        });
    } else {
        notifyToUI('There was an error connecting');
    }
}
// Read tokens from JSONBin

export async function fetchDataFromJSONBin(id, secret, name): Promise<any> {
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
        if (jsonBinData?.values?.options) {
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

export async function pullRemoteTokens({id, secret, provider, name}) {
    if (!id && !secret) return;

    notifyToUI('Fetching from remote...');
    let tokenValues;

    switch (provider) {
        case StorageProviderType.JSONBIN: {
            tokenValues = await fetchDataFromJSONBin(id, secret, name);
            notifyToUI('Updated!');
            break;
        }
        default:
            throw new Error('Not implemented');
    }
    return tokenValues;
}

export async function updateTokensOnSources(state: StateType, updatedAt: string) {
    if (state.storageType.provider !== StorageProviderType.LOCAL)
        updateRemoteTokens({
            tokens: state.tokenData.reduceToValues(),
            id: state.api.id,
            secret: state.api.secret,
            updatedAt,
            oldUpdatedAt: state.tokenData.getUpdatedAt(),
        }).then(() => {
            state.tokenData.setUpdatedAt(updatedAt);
        });

    postToFigma({
        type: MessageToPluginTypes.UPDATE,
        tokenValues: state.tokenData.reduceToValues(),
        tokens: state.tokenData.getMergedTokens(),
        updatePageOnly: state.updatePageOnly,
        updatedAt,
    });
}

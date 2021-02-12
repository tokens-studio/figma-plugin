import * as pjs from '../../../package.json';
import {notifyToUI, postToFigma} from '../../plugin/notifiers';
import {TokenProps} from './TokenData';

export async function compareUpdatedAt(oldUpdatedAt, newUpdatedAt) {
    console.log('comparing', oldUpdatedAt, newUpdatedAt);
    if (newUpdatedAt > oldUpdatedAt) {
        console.log('Remote is newer');
        return 'remote_newer';
    }
    if (newUpdatedAt === oldUpdatedAt) {
        console.log('remote and old are the same');
        return 'same';
    }
    console.log('Local state is newer');
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
            console.log('Updating remote, as its older');
            writeTokensToJSONBin({secret, id, tokenObj});
        } else {
            // Tell the user to choose between:
            // A) Pull Remote values and replace local changes
            // B) Overwrite Remote changes
            console.log('Not updating remote, add Modal asking user to choose how to handle this');
        }
    } else {
        console.log('fresh bin');
        writeTokensToJSONBin({secret, id, tokenObj});
    }
}

export async function createNewBin({secret, tokens, name, updatedAt, setApiData, setStorageType}) {
    notifyToUI('Creating new bin...');

    const provider = 'jsonbin';
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
            type: 'credentials',
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
        console.log('data is', jsonBinData);
        postToFigma({
            type: 'credentials',
            id,
            name,
            secret,
            provider: 'jsonbin',
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

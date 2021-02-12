import * as pjs from '../../../package.json';
import {notifyToUI, postToFigma} from '../../plugin/notifiers';

export async function updateRemoteTokens({tokens, id, secret, updatedAt}) {
    notifyToUI('Updating remote...');

    if (!id && !secret) return;

    const tokenObj = {
        version: pjs.version,
        updatedAt,
        values: {
            options: JSON.parse(tokens.options),
        },
    };

    const response = await fetch(`https://api.jsonbin.io/b/${id}`, {
        method: 'PUT',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        body: JSON.stringify(tokenObj, null, 2),
        headers: {
            'Content-Type': 'application/json',
            'secret-key': secret,
            versioning: false,
        },
    });

    await response.json();

    if (response.ok) {
        notifyToUI('Updated Remote');
    } else {
        notifyToUI('Error updating remote');
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
        body: '{"Sample": "Hello World"}',
        headers: {
            'Content-Type': 'application/json',
            'secret-key': secret,
        },
    });
    if (response) {
        const jsonBinData = await response.json();
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
        const jsonBinData = await response.json();
        postToFigma({
            type: 'credentials',
            id,
            name,
            secret,
            provider: 'jsonbin',
            msg: 'Connection successful',
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
    } else {
        notifyToUI('There was an error connecting, check your sync settings');
    }
    return tokenValues;
}

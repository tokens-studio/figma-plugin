// import * as pjs from '../../../../package.json';
import {notifyToUI, postToFigma} from '../../../plugin/notifiers';
import {StorageProviderType} from '../../../types/api';
import {MessageToPluginTypes} from '../../../types/messages';
import {TokenProps} from '../../../types/tokens';
// import {compareUpdatedAt} from '../../components/utils';

export async function readTokensFromArcade({secret, id}): Promise<TokenProps> | null {
    try {
        const res = await fetch(
            `https://api.usearcade.com/api/projects/${id}/tokens/live/export/json-tokens-nested/raw`,
            {
                headers: {
                    authorization: `Bearer ${secret}`,
                },
            }
        ).then(async (r) => {
            if (!r.ok) {
                throw await r.json();
            }
            return r.json();
        });

        const {exports} = res;
        console.log('exports', exports, res);
        return exports;
    } catch (err) {
        console.log(err);
    }

    notifyToUI('There was an error connecting, check your sync settings');
    return null;
}

export async function writeTokensToArcade({secret, id, tokenObj}): Promise<TokenProps> | null {
    console.log({secret, id, tokenObj});
    // const response = await fetch(`https://api.jsonbin.io/b/${id}`, {
    //     method: 'PUT',
    //     mode: 'cors',
    //     cache: 'no-cache',
    //     credentials: 'same-origin',
    //     body: tokenObj,
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'secret-key': secret,
    //     },
    // });

    // const res = await response.json();

    // if (response.ok) {
    //     notifyToUI('Updated Remote');
    //     return res;
    // }
    // notifyToUI('Error updating remote');
    console.log('Not implemented');
    return null;
}

export async function updateArcadeTokens({tokens, id, secret, updatedAt, oldUpdatedAt = null}) {
    console.log({tokens, id, secret, updatedAt, oldUpdatedAt});
    // const tokenObj = JSON.stringify(
    //     {
    //         version: pjs.version,
    //         updatedAt,
    //         values: {
    //             options: JSON.parse(tokens.options),
    //         },
    //     },
    //     null,
    //     2
    // );

    // if (oldUpdatedAt) {
    //     const remoteTokens = await readTokensFromJSONBin({secret, id});
    //     const comparison = await compareUpdatedAt(oldUpdatedAt, remoteTokens.updatedAt);
    //     if (comparison === 'remote_older') {
    //         writeTokensToJSONBin({secret, id, tokenObj});
    //     } else {
    //         // Tell the user to choose between:
    //         // A) Pull Remote values and replace local changes
    //         // B) Overwrite Remote changes
    //         console.log('Not updating remote, add Modal asking user to choose how to handle this');
    //     }
    // } else {
    //     writeTokensToJSONBin({secret, id, tokenObj});
    // }
    console.log('Not implemented');
}

export async function createNewArcade({provider, secret, tokens, name, updatedAt, setApiData, setStorageType}) {
    console.log({provider, secret, tokens, name, updatedAt, setApiData, setStorageType});
    // const response = await fetch(`https://api.jsonbin.io/b`, {
    //     method: 'POST',
    //     mode: 'cors',
    //     cache: 'no-cache',
    //     credentials: 'same-origin',
    //     body: JSON.stringify({
    //         version: pjs.version,
    //         updatedAt,
    //         values: {
    //             options: {},
    //         },
    //     }),
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'secret-key': secret,
    //         versioning: 'false',
    //     },
    // });
    // const jsonBinData = await response.json();
    // if (jsonBinData.success) {
    //     setApiData({id: jsonBinData.id, name, secret, provider});
    //     setStorageType({id: jsonBinData.id, name, provider}, true);
    //     updateJSONBinTokens({
    //         tokens,
    //         id: jsonBinData.id,
    //         secret,
    //         updatedAt,
    //     });
    //     postToFigma({
    //         type: MessageToPluginTypes.CREDENTIALS,
    //         id: jsonBinData.id,
    //         name,
    //         secret,
    //         provider,
    //     });
    // }
    console.log('Not implemented');
}

// Read tokens from JSONBin

export async function fetchDataFromArcade(id, secret, name): Promise<TokenProps> {
    console.log('executing arcade', id, secret, name);
    let tokenValues;

    if (!id && !secret) return;

    const data = await readTokensFromArcade({id, secret});

    if (data) {
        postToFigma({
            type: MessageToPluginTypes.CREDENTIALS,
            id,
            name,
            secret,
            provider: StorageProviderType.ARCADE,
        });
        console.log('data is', data);
        const tokens = data['json-tokens-nested'];
        if (tokens?.output) {
            console.log('got options!', tokens.output);
            const parsedTokens = JSON.parse(tokens.output);
            const groups = Object.entries(parsedTokens).map((group) => [group[0], JSON.stringify(group[1], null, 2)]);
            const groupedValues = Object.fromEntries(groups);

            console.log('tokens are', groups, groupedValues);
            const obj = {
                version: data.version,
                updatedAt: data.updatedAt,
                values: groupedValues,
            };

            tokenValues = obj;
        } else {
            notifyToUI('No tokens stored on remote');
        }
    }

    return tokenValues;
}

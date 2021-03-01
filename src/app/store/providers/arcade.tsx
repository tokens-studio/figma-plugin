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
        return exports;
    } catch (err) {
        console.log(err);
    }

    notifyToUI('There was an error connecting, check your sync settings');
    return null;
}

export async function writeTokensToArcade({secret, id, tokenObj}): Promise<TokenProps> | null {
    console.log({secret, id, tokenObj});
    throw new Error('Not implemented');
}

export async function updateArcadeTokens({tokens, id, secret, updatedAt, oldUpdatedAt = null}) {
    console.log({tokens, id, secret, updatedAt, oldUpdatedAt});
    throw new Error('Not implemented');
}

export async function createNewArcade({provider, secret, tokens, name, updatedAt, setApiData, setStorageType}) {
    console.log({provider, secret, tokens, name, updatedAt, setApiData, setStorageType});
    throw new Error('Not implemented');
}

// Read tokens from Arcade

export async function fetchDataFromArcade(id, secret, name): Promise<TokenProps> {
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
        const tokens = data['json-tokens-nested'];
        if (tokens?.output) {
            const parsedTokens = JSON.parse(tokens.output);
            const groups = Object.entries(parsedTokens).map((group) => [group[0], JSON.stringify(group[1], null, 2)]);
            const groupedValues = Object.fromEntries(groups);

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

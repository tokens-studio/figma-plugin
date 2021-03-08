import {notifyToUI, postToFigma} from '../../../plugin/notifiers';
import {StorageProviderType} from '../../../types/api';
import {MessageToPluginTypes} from '../../../types/messages';
import {TokenProps} from '../../../types/tokens';
import {useTokenDispatch} from '../TokenContext';

async function readTokensFromArcade({secret, id}): Promise<TokenProps> | null {
    try {
        const res = await fetch(
            `https://api.usearcade.com/api/projects/${id}/tokens/live/export/figma-tokens-plugin/raw`,
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

        console.log('RES IS', res);

        return res.exports;
    } catch (err) {
        notifyToUI('Error fetching from Arcade, check console (F12)');
        console.log('Error fetching from Arcade: ', err);
    }

    return null;
}

async function writeTokensToArcade(): Promise<TokenProps> | null {
    throw new Error('Not implemented');
}

export default function useArcade() {
    const {setProjectURL} = useTokenDispatch();

    async function updateArcadeTokens() {
        throw new Error('Not implemented');
    }

    async function createNewArcade() {
        return null;
    }
    // Read tokens from Arcade
    async function fetchDataFromArcade(id, secret, name): Promise<TokenProps> {
        try {
            let tokenValues;

            if (!id && !secret) return;

            const exports = await readTokensFromArcade({id, secret});

            if (exports) {
                setProjectURL(`https://app.usearcade.com/projects/${id}`);
                postToFigma({
                    type: MessageToPluginTypes.CREDENTIALS,
                    id,
                    name,
                    secret,
                    provider: StorageProviderType.ARCADE,
                });
                const tokens = exports['figma-tokens-plugin'];
                if (tokens?.output) {
                    const parsedTokens = JSON.parse(tokens.output);
                    const groups = Object.entries(parsedTokens).map((group) => [
                        group[0],
                        JSON.stringify(group[1], null, 2),
                    ]);
                    const groupedValues = Object.fromEntries(groups);

                    const obj = {
                        version: exports.version,
                        updatedAt: exports.updatedAt,
                        values: groupedValues,
                    };

                    tokenValues = obj;
                } else {
                    notifyToUI('No tokens stored on remote');
                }

                return tokenValues;
            }
        } catch (e) {
            return null;
        }
    }

    return {
        fetchDataFromArcade,
        updateArcadeTokens,
        createNewArcade,
    };
}

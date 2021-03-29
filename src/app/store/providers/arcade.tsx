import {notifyToUI, postToFigma} from '../../../plugin/notifiers';
import {StorageProviderType} from '../../../../types/api';
import {MessageToPluginTypes} from '../../../../types/messages';
import {TokenProps} from '../../../../types/tokens';
import {useTokenDispatch} from '../TokenContext';

async function readTokensFromArcade({secret, id}): Promise<TokenProps> | null {
    try {
        const res = await fetch(
            `https://api.usearcade.com/api/projects/${id}/tokens/draft/export/figma-tokens-plugin/raw`,
            {
                headers: {
                    authorization: `Bearer ${secret}`,
                },
            }
        ).then(async (r) => {
            if (!r.ok) {
                throw await r.json();
            }
            console.log('r', r);
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

    async function editArcadeToken({id, secret, data}): Promise<boolean> {
        console.log('Calling edit arcade token', data);
        const {name, parent, value, options} = data;
        const {description} = options;
        const tokenName = [parent, name].join('.');
        const newToken: {
            name: string;
            value: string;
            description?: string;
        } = {
            name: tokenName,
            value,
        };
        if (description) {
            newToken.description = description;
        }
        try {
            await fetch(`https://api.usearcade.com/api/projects/${id}/tokens/${tokenName}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    newToken,
                    from: 'figma',
                    changeComment: 'Need this to be a shorter name',
                }),
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `Bearer ${secret}`,
                },
            }).then(async (r) => {
                if (!r.ok) {
                    throw await r.json();
                }
                return r.json();
            });

            return true;
        } catch (err) {
            notifyToUI('Error editing token on Arcade, check console (F12)');
            console.log('Error editing token on Arcade: ', err);
            return false;
        }
    }

    // Read tokens from Arcade
    async function fetchDataFromArcade(id, secret, name): Promise<TokenProps> {
        console.log('Fetching from arcade', id, secret, name);
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

    async function deleteArcadeToken({id, secret, data}) {
        console.log('Calling delete arcade token', data);
        const {parent, path} = data;
        const tokenName = [parent, path].join('.');
        try {
            const res = await fetch(`https://api.usearcade.com/api/projects/${id}/tokens/${tokenName}`, {
                method: 'DELETE',
                headers: {
                    authorization: `Bearer ${secret}`,
                },
            }).then(async (r) => {
                if (!r.ok) {
                    throw await r.json();
                }
                return r.json();
            });
            if (res) {
                console.log('Success');
            }
        } catch (err) {
            notifyToUI('Error editing token on Arcade, check console (F12)');
            console.log('Error editing token on Arcade: ', err);
        }
    }

    return {
        fetchDataFromArcade,
        updateArcadeTokens,
        editArcadeToken,
        deleteArcadeToken,
        createNewArcade,
    };
}

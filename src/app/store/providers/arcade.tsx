import {notifyToUI, postToFigma} from '../../../plugin/notifiers';
import {StorageProviderType} from '../../../../types/api';
import {MessageToPluginTypes} from '../../../../types/messages';
import {TokenProps, TokenType} from '../../../../types/tokens';
import {useTokenDispatch} from '../TokenContext';

type ArcadeResponse = {
    exports: object;
    version: string;
};

async function readTokensFromArcade({secret, id}): Promise<ArcadeResponse> | null {
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

        return res;
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
        const {name, value, options} = data;
        const {description, type} = options;
        const tokenName = name;
        const newToken: {
            name: string;
            value: string;
            description?: string;
            type?: string;
        } = {
            name: tokenName,
            value,
        };
        if (description) {
            newToken.description = description;
        }
        if (type) {
            newToken.type = type;
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

    async function createArcadeToken({id, secret, data}): Promise<boolean> {
        console.log('Calling create arcade token', data);
        const {name, value, options = {}} = data;
        const {description, type} = options;
        const tokenName = name;
        const tokenObj: {
            name: string;
            value: string;
            description?: string;
            type?: TokenType;
        } = {
            name: tokenName,
            value,
        };
        if (description) {
            tokenObj.description = description;
        }
        if (type) {
            tokenObj.type = type;
        }
        try {
            await fetch(`https://api.usearcade.com/api/projects/${id}/tokens`, {
                method: 'POST',
                body: JSON.stringify({
                    ...tokenObj,
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
            notifyToUI('Error creating token on Arcade, check console (F12)');
            console.log('Error creating token on Arcade: ', err);
            return false;
        }
    }

    // Read tokens from Arcade
    async function fetchDataFromArcade(id, secret, name): Promise<TokenProps> {
        console.log('Fetching from arcade', id, secret, name);
        try {
            let tokenValues;

            if (!id && !secret) return;

            const res = await readTokensFromArcade({id, secret});

            if (res.exports) {
                setProjectURL(`https://app.usearcade.com/projects/${id}`);
                postToFigma({
                    type: MessageToPluginTypes.CREDENTIALS,
                    id,
                    name,
                    secret,
                    provider: StorageProviderType.ARCADE,
                });
                const tokens = res.exports['figma-tokens-plugin'];
                if (tokens?.output) {
                    const parsedTokens = JSON.parse(tokens.output);
                    console.log('Parsed tokens', parsedTokens);

                    const obj = {
                        version: res.version,
                        values: parsedTokens.tokens,
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
        const {path} = data;
        const tokenName = path;
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
            notifyToUI('Error deleting token on Arcade, check console (F12)');
            console.log('Error deleting token on Arcade: ', err);
        }
    }

    return {
        fetchDataFromArcade,
        updateArcadeTokens,
        createArcadeToken,
        editArcadeToken,
        deleteArcadeToken,
        createNewArcade,
    };
}

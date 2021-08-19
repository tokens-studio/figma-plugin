import {useDispatch} from 'react-redux';
import {Dispatch} from '@/app/store';
import {StorageProviderType} from 'Types/api';
import {MessageToPluginTypes} from 'Types/messages';
import {TokenProps} from 'Types/tokens';
import convertTokensToObject from '@/utils/convertTokensToObject';
import {Octokit} from '@octokit/rest';
import {notifyToUI, postToFigma} from '../../../plugin/notifiers';
import {compareUpdatedAt} from '../../components/utils';
import * as pjs from '../../../../package.json';

/** Returns a URL to a page where the user can create a pull request with a given branch */
function getCreatePullRequestUrl(owner: string, repo: string, branchName: string) {
    return `https://github.com/${owner}/${repo}/compare/${branchName}?expand=1`;
}

const fetchUsername = async (context) => {
    const octokit = new Octokit({auth: context.accessToken});
    const user = await octokit.users.getAuthenticated().then((response) => response.data);
    return user.login;
};

const fetchBranches = async (context) => {
    const octokit = new Octokit({auth: context.accessToken});
    const branches = await octokit.repos.listBranches({owner, repo}).then((response) => response.data);
    return branches.map((branch) => branch.name);
};
const commitToNewBranch = async (context) => {
    const octokit = new Octokit({auth: context.accessToken});
    await octokit.repos.createOrUpdateFile({
        owner,
        repo,
        branch: context.newBranchName,
        createBranch: true,
        message: context.commitMessage || context.defaultCommitMessage,
        content: 'My new content',
    });
};

const commitToExistingBranch = async (context) => {
    const octokit = new Octokit({auth: context.accessToken});
    await octokit.repos.createOrUpdateFile({
        owner,
        repo,
        branch: context.existingBranchName,
        createBranch: false,
        message: context.commitMessage || context.defaultCommitMessage,
        content: 'My new content',
    });
};

async function readTokensFromGitHub(context): Promise<TokenProps> | null {
    const user = await fetchUsername(context);
    const branches = await fetchBranches(context);
    console.log('user, branches', user, branches);

    // const response = await fetch(`https://api.github.com/${id}/git/contents/${filename}`, {
    //     method: 'GET',
    //     headers: {
    //         Authorization: secret,
    //         Accept: 'application/vnd.github.v3+json',
    //     },
    // });

    // if (response.ok) {
    //     const data = await response.json();
    //     const decoded = atob(data.content);
    //     const parsed = JSON.parse(decoded);
    //     return parsed;
    // }
    notifyToUI('There was an error connecting, check your sync settings');
    return null;
}

async function writeTokensToGitHub({context, tokenObj}): Promise<TokenProps> | null {
    const commitResponse = await commitToNewBranch(context);
    console.log('Commitresponse', commitResponse);
    // const response = await fetch(`https://api.github.com/${id}/git/dispatches`, {
    //     method: 'POST',
    //     body: {
    //         message: 'Commit from Figma Tokens',
    //         content: tokenObj,
    //     },
    //     headers: {
    //         Authorization: secret,
    //         Accept: 'application/vnd.github.v3+json',
    //     },
    // });

    // if (response.ok) {
    //     const res = await response.json();
    //     notifyToUI('Updated Remote');
    //     return res;
    // }
    notifyToUI('Error updating remote');
    return null;
}

export async function updateGitHubTokens(context) {
    try {
        const tokenObj = JSON.stringify(
            {
                version: pjs.plugin_version,
                updatedAt: context.updatedAt,
                values: convertTokensToObject(context.tokens),
            },
            null,
            2
        );

        if (context.oldUpdatedAt) {
            const remoteTokens = await readTokensFromGitHub(context);
            const comparison = await compareUpdatedAt(context.oldUpdatedAt, remoteTokens.updatedAt);
            if (comparison === 'remote_older') {
                writeTokensToGitHub({context, tokenObj});
            } else {
                // Tell the user to choose between:
                // A) Pull Remote values and replace local changes
                // B) Overwrite Remote changes
                notifyToUI('Error updating tokens as remote is newer, please update first');
            }
        } else {
            writeTokensToGitHub({secret, id, tokenObj});
        }
    } catch (e) {
        console.log('Error updating jsonbin', e);
    }
}

export function useGitHub() {
    const dispatch = useDispatch<Dispatch>();

    async function createNewGitHub({provider, secret, tokens, name, updatedAt}): Promise<TokenProps> {
        return null;
    }

    // Read tokens from JSONBin

    async function fetchDataFromGitHub(context): Promise<TokenProps> {
        let tokenValues;

        try {
            const data = await readTokensFromGitHub(context);
            dispatch.uiState.setProjectURL(context.id);

            if (data) {
                postToFigma({
                    type: MessageToPluginTypes.CREDENTIALS,
                    ...context,
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
        fetchDataFromGitHub,
        createNewGitHub,
    };
}

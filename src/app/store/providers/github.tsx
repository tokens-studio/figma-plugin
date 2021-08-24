import {useDispatch} from 'react-redux';
import {Dispatch} from '@/app/store';
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
    const branches = await octokit.repos
        .listBranches({owner: context.owner, repo: context.repo})
        .then((response) => response.data);
    return branches.map((branch) => branch.name);
};

const readContents = async (context) => {
    console.log('reading', context);
    const octokit = new Octokit({auth: context.accessToken});
    let response;
    try {
        response = await octokit.rest.repos.getContent({
            owner: context.owner,
            repo: context.repo,
            path: context.filePath,
            ref: context.branch,
        });
        console.log('response status is', response.status);
        return response;
    } catch (e) {
        if (e === 'HttpError: Bad credentials') {
            throw new Error('UNAUTHORIZED');
        }
        return null;
    }
};

const commitToNewBranch = async (context, tokenObj) => {
    console.log('Committing to existinewng', context);

    const octokit = new Octokit({auth: context.accessToken});
    return octokit.repos.createOrUpdateFileContents({
        owner: context.owner,
        repo: context.repo,
        branch: context.branch,
        createBranch: true,
        message: context.commitMessage || 'Test commit',
        content: btoa(tokenObj),
        path: context.filePath,
    });
};

const commitToExistingBranch = async (context, tokenObj) => {
    console.log('Committing to existing', context);
    const octokit = new Octokit({auth: context.accessToken});
    return octokit.repos.createOrUpdateFileContents({
        owner: context.owner,
        repo: context.repo,
        branch: context.branch,
        createBranch: false,
        message: context.commitMessage || 'Test commit',
        content: btoa(tokenObj),
        path: context.filePath,
    });
};

async function readTokensFromGitHub(context): Promise<TokenProps> | null {
    try {
        const response = await readContents(context);
        console.log('RESPONSE IS', response);
        if (response) {
            if (response.data.content) {
                const data = atob(response.data.content);
                const parsed = JSON.parse(data);
                return parsed;
            } else {
            }
        }
    } catch (e) {
        notifyToUI('There was an error connecting, check your sync settings');
        return null;
    }
}

async function writeTokensToGitHub({context, tokenObj}): Promise<TokenProps> | null {
    const user = await fetchUsername(context);
    const branches = await fetchBranches(context);
    console.log('user, branches', user, branches);
    let result;
    if (branches.includes(context.branch)) {
        console.log('Branch exists, read file from this branch');
        // If File exists read from that file

        // Else commit to this existing branch
        result = await commitToExistingBranch(context, tokenObj);
    } else {
        console.log('Branch does not exist, read file from this branch');

        result = await commitToNewBranch(context, tokenObj);
    }
    console.log('Result is', result);
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
            writeTokensToGitHub({context, tokenObj});
        }
    } catch (e) {
        console.log('Error updating jsonbin', e);
    }
}

export function useGitHub() {
    const dispatch = useDispatch<Dispatch>();

    // Read tokens from JSONBin

    async function fetchDataFromGitHub(context): Promise<TokenProps> {
        let tokenValues;

        try {
            const data = await readTokensFromGitHub(context);
            console.log('DATA IS', data);

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
            } else {
                // No data on GitHub yet, commit it
                writeTokensToGitHub({context, tokenObj});
            }

            return tokenValues;
        } catch (e) {
            notifyToUI('Error fetching from URL, check console (F12)');
            console.log('Error:', e);
        }
    }
    return {
        fetchDataFromGitHub,
    };
}

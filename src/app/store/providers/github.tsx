import {useSelector} from 'react-redux';
import {RootState} from '@/app/store';
import {MessageToPluginTypes} from 'Types/messages';
import {TokenProps} from 'Types/tokens';
import convertTokensToObject from '@/utils/convertTokensToObject';
import {Octokit} from '@octokit/rest';
import {notifyToUI, postToFigma} from '../../../plugin/notifiers';
import * as pjs from '../../../../package.json';

/** Returns a URL to a page where the user can create a pull request with a given branch */
function getCreatePullRequestUrl(owner: string, repo: string, branchName: string) {
    return `https://github.com/${owner}/${repo}/compare/${branchName}?expand=1`;
}

export const fetchUsername = async (context) => {
    const octokit = new Octokit({auth: context.secret});
    const user = await octokit.users.getAuthenticated().then((response) => response.data);
    return user.login;
};

export const fetchBranches = async ({context, owner, repo}) => {
    const octokit = new Octokit({auth: context.secret});
    const branches = await octokit.repos.listBranches({owner, repo}).then((response) => response.data);
    return branches.map((branch) => branch.name);
};

type ContextObject = {
    secret: string;
    id: string;
    branch: string;
    filePath: string;
    tokens: string;
};

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

export const readContents = async ({context, owner, repo}) => {
    console.log('reading', context);
    const octokit = new Octokit({auth: context.secret});
    let response;

    try {
        response = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: context.filePath,
            ref: context.branch,
        });
        console.log('Response from file is', response);
        if (response.data.content) {
            const data = atob(response.data.content);
            // If content of file is parseable JSON, parse it
            if (IsJsonString(data)) {
                const parsed = JSON.parse(data);
                return parsed;
            }
            // If not, return string only as we can't process that file
            return data;
        }
        return null;
    } catch (e) {
        // Raise error (usually this is an auth error)
        console.log('some error', e);
        return null;
    }
};

const commitToNewBranch = async ({context, tokenObj, owner, repo}) => {
    console.log('Committing to new', context);

    const OctokitWithPlugin = Octokit.plugin(require('octokit-commit-multiple-files'));
    const octokit = new OctokitWithPlugin({auth: context.secret});

    return octokit.repos.createOrUpdateFiles({
        owner,
        repo,
        branch: context.branch,
        createBranch: true,
        changes: [{message: context.commitMessage || 'Test commit', files: {[context.filePath]: tokenObj}}],
    });
};

const commitToExistingBranch = async ({context, tokenObj, owner, repo}) => {
    console.log('Committing to existing', context);
    const OctokitWithPlugin = Octokit.plugin(require('octokit-commit-multiple-files'));
    const octokit = new OctokitWithPlugin({auth: context.secret});
    return octokit.repos.createOrUpdateFiles({
        owner,
        repo,
        branch: context.branch,
        createBranch: false,
        changes: [{message: context.commitMessage || 'Test commit', files: {[context.filePath]: tokenObj}}],
    });
};

async function writeTokensToGitHub({
    context,
    tokenObj,
    owner,
    repo,
}: {
    context: ContextObject;
    tokenObj: string;
    owner: string;
    repo: string;
}): Promise<TokenProps> | null {
    const branches = await fetchBranches({context, owner, repo});
    console.log('Branches are', branches, context);
    if (!branches) return null;
    let result;
    if (branches.includes(context.branch)) {
        console.log('Branch exists, read file from this branch');
        result = await commitToExistingBranch({context, tokenObj, owner, repo});
    } else {
        console.log('Branch does not exist, commit to new branch');

        result = await commitToNewBranch({context, tokenObj, owner, repo});
    }
    console.log('Result is', result);
    notifyToUI('Error updating remote');
    return null;
}

function askUserIfPushLocal() {
    // Todo: Implement logic
    return false;
}

export async function syncTokensWithGitHub({context, tokens}) {
    const rawTokenObj = {
        version: pjs.plugin_version,
        updatedAt: context.updatedAt,
        values: convertTokensToObject(tokens),
    };
    const [owner, repo] = context.id.split('/');

    const tokenObj = JSON.stringify(rawTokenObj, null, 2);
    const content = await readContents({context, owner, repo});
    if (content) {
        console.log('Response is', content);
        console.log('old tokens are', tokenObj);
        if (content === tokenObj) {
            console.log('Both are equal, do nothing');
            return rawTokenObj;
        }
        // Is not the same, ask user if we should push changes or pull from repo
        console.log('IS not same!');
        const userWantsToPush = await askUserIfPushLocal();
        if (userWantsToPush) {
            // User wants to push
            await writeTokensToGitHub({context, tokenObj, owner, repo});
            return rawTokenObj;
        }
        return content;
    }
    // File does not exist, write it!
    await writeTokensToGitHub({context, tokenObj, owner, repo});
    return rawTokenObj;
}

export function useGitHub() {
    const {tokens} = useSelector((state: RootState) => state.tokenState);

    async function readTokensFromGitHub(context): Promise<TokenProps> | null {
        try {
            return syncTokensWithGitHub({context, tokens});
        } catch (e) {
            notifyToUI('There was an error connecting, check your sync settings');
            return null;
        }
    }

    async function fetchDataFromGitHub(context): Promise<TokenProps> {
        let tokenObj;

        try {
            const data = await readTokensFromGitHub(context);
            console.log('DATA IS', data);

            if (data) {
                console.log('Giving Figma Credentials', context);
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

                    tokenObj = obj;
                } else {
                    notifyToUI('No tokens stored on remote');
                }
            }

            return tokenObj;
        } catch (e) {
            notifyToUI('Error fetching from URL, check console (F12)');
            console.log('Error:', e);
        }
    }
    return {
        fetchDataFromGitHub,
        readTokensFromGitHub,
    };
}

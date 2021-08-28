import {useSelector} from 'react-redux';
import {RootState} from '@/app/store';
import {MessageToPluginTypes} from 'Types/messages';
import {TokenProps} from 'Types/tokens';
import convertTokensToObject from '@/utils/convertTokensToObject';
import {Octokit} from '@octokit/rest';
import useConfirm from '@/app/hooks/useConfirm';
import usePushDialog from '@/app/hooks/usePushDialog';
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
    const octokit = new Octokit({auth: context.secret});
    let response;

    try {
        response = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: context.filePath,
            ref: context.branch,
        });
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
        console.log('Error', e);
        return null;
    }
};

const commitToNewBranch = async ({context, tokenObj, owner, repo, commitMessage}) => {
    const OctokitWithPlugin = Octokit.plugin(require('octokit-commit-multiple-files'));
    const octokit = new OctokitWithPlugin({auth: context.secret});

    return octokit.repos.createOrUpdateFiles({
        owner,
        repo,
        branch: context.branch,
        createBranch: true,
        changes: [{message: commitMessage || 'Commit from Figma', files: {[context.filePath]: tokenObj}}],
    });
};

const commitToExistingBranch = async ({context, tokenObj, owner, repo, commitMessage}) => {
    const OctokitWithPlugin = Octokit.plugin(require('octokit-commit-multiple-files'));
    const octokit = new OctokitWithPlugin({auth: context.secret});
    return octokit.repos.createOrUpdateFiles({
        owner,
        repo,
        branch: context.branch,
        createBranch: false,
        changes: [{message: commitMessage || 'Commit from Figmaƒ', files: {[context.filePath]: tokenObj}}],
    });
};

async function writeTokensToGitHub({
    context,
    tokenObj,
    owner,
    repo,
    commitMessage,
}: {
    context: ContextObject;
    tokenObj: string;
    owner: string;
    repo: string;
    commitMessage?: string;
}): Promise<TokenProps> | null {
    const branches = await fetchBranches({context, owner, repo});
    if (!branches) return null;
    let result;
    if (branches.includes(context.branch)) {
        result = await commitToExistingBranch({context, tokenObj, owner, repo, commitMessage});
    } else {
        result = await commitToNewBranch({context, tokenObj, owner, repo, commitMessage});
    }
    notifyToUI('Error updating remote');
    return null;
}

export async function pushTokensToGitHub({context}) {
    return useGitHub().syncTokensWithGitHub({context});
}

export function useGitHub() {
    const {tokens} = useSelector((state: RootState) => state.tokenState);
    const {confirm} = useConfirm();
    const {pushDialog} = usePushDialog();

    async function askUserIfPull(): Promise<boolean> {
        const isConfirmed = await confirm('Pull from GitHub?');
        return isConfirmed;
    }

    async function syncTokensWithGitHub({context, shouldPush = false}) {
        const rawTokenObj = {
            version: pjs.plugin_version,
            updatedAt: context.updatedAt,
            values: convertTokensToObject(tokens),
        };
        const [owner, repo] = context.id.split('/');

        const tokenObj = JSON.stringify(rawTokenObj, null, 2);
        const content = await readContents({context, owner, repo});
        if (content) {
            if (content === tokenObj) {
                return rawTokenObj;
            }
            // Is not the same, ask user if we should push changes or pull from repo
            let userWantsToPull = true;
            if (!shouldPush) {
                userWantsToPull = await askUserIfPull();
            }
            if (shouldPush) {
                const commitMessage = await pushDialog();
                if (commitMessage) {
                    await writeTokensToGitHub({context, tokenObj, owner, repo, commitMessage});
                }
            }
            if (userWantsToPull) {
                return content;
            }
            return rawTokenObj;
        }
        // File does not exist, write it!
        await writeTokensToGitHub({context, tokenObj, owner, repo});
        return rawTokenObj;
    }

    async function readTokensFromGitHub(context, shouldPush = false): Promise<TokenProps> | null {
        try {
            return syncTokensWithGitHub({context, shouldPush});
        } catch (e) {
            notifyToUI('There was an error connecting, check your sync settings');
            return null;
        }
    }

    async function fetchDataFromGitHub(context): Promise<TokenProps> {
        let tokenObj;

        try {
            const data = await readTokensFromGitHub(context);

            if (data) {
                postToFigma({
                    type: MessageToPluginTypes.CREDENTIALS,
                    ...context,
                });
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
        syncTokensWithGitHub,
    };
}

import {useDispatch, useSelector} from 'react-redux';
import {Dispatch, RootState} from '@/app/store';
import {MessageToPluginTypes} from 'Types/messages';
import {TokenProps} from 'Types/tokens';
import convertTokensToObject from '@/utils/convertTokensToObject';
import {Octokit} from '@octokit/rest';
import useConfirm from '@/app/hooks/useConfirm';
import usePushDialog from '@/app/hooks/usePushDialog';
import {notifyToUI, postToFigma} from '../../../plugin/notifiers';
import * as pjs from '../../../../package.json';
import useStorage from '../useStorage';

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
            // If not, return string only as we can't process that file. We should probably not return a string though.
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
        changes: [{message: commitMessage || 'Commit from Figma', files: {[context.filePath]: tokenObj}}],
    });
};

export function useGitHub() {
    const {tokens} = useSelector((state: RootState) => state.tokenState);
    const dispatch = useDispatch<Dispatch>();
    const {setStorageType} = useStorage();

    const {confirm} = useConfirm();
    const {pushDialog} = usePushDialog();

    async function askUserIfPull(): Promise<boolean> {
        const isConfirmed = await confirm('Pull from GitHub?');
        return isConfirmed;
    }

    function getTokenObj() {
        const raw = {
            version: pjs.plugin_version,
            values: convertTokensToObject(tokens),
        };
        const string = JSON.stringify(raw, null, 2);
        return {raw, string};
    }

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
    }): Promise<TokenProps | null> {
        try {
            const branches = await fetchBranches({context, owner, repo});
            if (!branches) return null;
            if (branches.includes(context.branch)) {
                await commitToExistingBranch({context, tokenObj, owner, repo, commitMessage});
            } else {
                await commitToNewBranch({context, tokenObj, owner, repo, commitMessage});
            }
            notifyToUI('Pushed changes to GitHub');
        } catch (e) {
            notifyToUI('Error pushing to GitHub');
            console.log('Error pushing to GitHub', e);
            return null;
        }
    }

    async function pushTokensToGitHub(context) {
        const {raw: rawTokenObj, string: tokenObj} = getTokenObj();
        const [owner, repo] = context.id.split('/');

        const content = await readContents({context, owner, repo});
        if (content) {
            const stringifiedContent = JSON.stringify(content, null, 2);

            if (content && stringifiedContent === tokenObj) {
                notifyToUI('Nothing to commit');
                return rawTokenObj;
            }
        }

        const commitMessage = await pushDialog();
        if (commitMessage) {
            await writeTokensToGitHub({context, tokenObj, owner, repo, commitMessage});
            notifyToUI('Updated!');
        }
        return rawTokenObj;
    }

    async function pullTokensFromGitHub(context) {
        const [owner, repo] = context.id.split('/');

        try {
            const content = await readContents({context, owner, repo});

            if (content) {
                return content;
            }
        } catch (e) {
            console.log('Error', e);
        }
        return null;
    }

    async function syncTokensWithGitHub(context) {
        try {
            const [owner, repo] = context.id.split('/');
            const isAuthed = await fetchBranches({context, owner, repo});

            if (!isAuthed) {
                return null;
            }
            const content = await readContents({context, owner, repo});
            const {raw: rawTokenObj, string: tokenObj} = getTokenObj();

            if (content) {
                const stringifiedContent = JSON.stringify(content, null, 2);

                if (stringifiedContent !== tokenObj) {
                    const userDecision = await askUserIfPull();
                    if (userDecision) {
                        return content;
                    }
                }
            } else {
                await pushTokensToGitHub(context);
            }
            return rawTokenObj;
        } catch (e) {
            console.log('Error', e);
        }
    }

    async function addNewGitHubCredentials(context): Promise<TokenProps> {
        let tokenObj;

        try {
            const data = await syncTokensWithGitHub(context);

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

                    dispatch.uiState.setApiData(context);
                    setStorageType({
                        provider: context,
                        bool: true,
                    });
                    dispatch.tokenState.setTokenData(obj);
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
        addNewGitHubCredentials,
        syncTokensWithGitHub,
        pullTokensFromGitHub,
        pushTokensToGitHub,
    };
}

import {useDispatch, useSelector} from 'react-redux';
import {Dispatch, RootState} from '@/app/store';
import {MessageToPluginTypes} from 'Types/messages';
import {TokenProps} from 'Types/tokens';
import convertTokensToObject from '@/utils/convertTokensToObject';
import {Octokit} from '@octokit/rest';
import useConfirm from '@/app/hooks/useConfirm';
import usePushDialog from '@/app/hooks/usePushDialog';
import IsJSONString from '@/utils/isJSONString';
import {ContextObject} from 'Types/api';
import {notifyToUI, postToFigma} from '../../../plugin/notifiers';

/** Returns a URL to a page where the user can create a pull request with a given branch */
export function getCreatePullRequestUrl(id: string, branchName: string) {
    return `https://github.com/${id}/compare/${branchName}?expand=1`;
}

export const fetchBranches = async ({context, owner, repo}) => {
    const octokit = new Octokit({auth: context.secret});
    const branches = await octokit.repos.listBranches({owner, repo}).then((response) => response.data);
    return branches.map((branch) => branch.name);
};

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
            if (IsJSONString(data)) {
                const parsed = JSON.parse(data);
                return {
                    values: parsed,
                };
            }
            return null;
        }
        // If not, return null as we can't process that file. We should let the user know, though.
        return null;
    } catch (e) {
        // Raise error (usually this is an auth error)
        console.log('Error', e);
        return null;
    }
};

const commitToNewBranch = async ({context, tokenObj, owner, repo, commitMessage, branch}) => {
    const OctokitWithPlugin = Octokit.plugin(require('octokit-commit-multiple-files'));
    const octokit = new OctokitWithPlugin({auth: context.secret});

    return octokit.repos.createOrUpdateFiles({
        owner,
        repo,
        branch,
        createBranch: true,
        changes: [{message: commitMessage || 'Commit from Figma', files: {[context.filePath]: tokenObj}}],
    });
};

const commitToExistingBranch = async ({context, tokenObj, owner, repo, commitMessage, branch}) => {
    const OctokitWithPlugin = Octokit.plugin(require('octokit-commit-multiple-files'));
    const octokit = new OctokitWithPlugin({auth: context.secret});
    return octokit.repos.createOrUpdateFiles({
        owner,
        repo,
        branch,
        createBranch: false,
        changes: [{message: commitMessage || 'Commit from Figma', files: {[context.filePath]: tokenObj}}],
    });
};

export function useGitHub() {
    const {tokens} = useSelector((state: RootState) => state.tokenState);
    const {localApiState} = useSelector((state: RootState) => state.uiState);
    const dispatch = useDispatch<Dispatch>();

    const {confirm} = useConfirm();
    const {pushDialog} = usePushDialog();

    async function askUserIfPull(): Promise<boolean> {
        const isConfirmed = await confirm({
            text: 'Pull from GitHub?',
            description: 'Your repo already contains tokens, do you want to pull these now?',
        });
        return isConfirmed;
    }

    function getTokenObj() {
        const raw = convertTokensToObject(tokens);
        const string = JSON.stringify(raw, null, 2);
        return {raw, string};
    }

    async function writeTokensToGitHub({
        context,
        tokenObj,
        owner,
        repo,
        commitMessage,
        customBranch,
    }: {
        context: ContextObject;
        tokenObj: string;
        owner: string;
        repo: string;
        commitMessage?: string;
        customBranch?: string;
    }): Promise<TokenProps | null> {
        try {
            const branches = await fetchBranches({context, owner, repo});
            const branch = customBranch || context.branch;
            if (!branches) return null;
            if (branches.includes(branch)) {
                await commitToExistingBranch({context, tokenObj, owner, repo, commitMessage, branch});
            } else {
                await commitToNewBranch({context, tokenObj, owner, repo, commitMessage, branch});
            }
            dispatch.tokenState.setLastSyncedState(tokenObj);
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

        const pushSettings = await pushDialog();
        if (pushSettings) {
            const {commitMessage, customBranch} = pushSettings;
            await writeTokensToGitHub({context, tokenObj, owner, repo, commitMessage, customBranch});
            dispatch.uiState.setLocalApiState({...localApiState, branch: customBranch});
            pushDialog('success');
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

    // Function to initially check auth and sync tokens with GitHub
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
            // If repo contains no tokens, return null
            return null;
        } catch (e) {
            console.log('Error', e);
        }
    }

    async function addNewGitHubCredentials(context): Promise<TokenProps> {
        let tokenObj;

        try {
            const data = await syncTokensWithGitHub(context);

            console.log('Adding new', context, data);

            if (data) {
                postToFigma({
                    type: MessageToPluginTypes.CREDENTIALS,
                    ...context,
                });
                if (data?.values) {
                    const obj = data;

                    dispatch.tokenState.setLastSyncedState(JSON.stringify(obj.values, null, 2));
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

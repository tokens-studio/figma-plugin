import { useCallback, useMemo } from 'react';
import { LDProps } from 'launchdarkly-react-client-sdk/lib/withLDConsumer';
import compact from 'just-compact';
import type {
  StorageProviderType, StorageTypeCredentials, StorageTypeFormValues, RemoteResponseData, PushOverrides,
} from '../types';
import { TokenFormat } from '../classes/TokenFormatStoreClass';
import { ErrorMessages } from '../constants';
import { applyTokenSetOrder, isEqual } from '../utils';
import { GithubTokenStorage } from '../storage/GitHubTokenStorage';

type GithubCredentials = Extract<StorageTypeCredentials, { provider: StorageProviderType.GITHUB; }>;
type GithubFormValues = Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.GITHUB }>;

// const storageClientFactory = useCallback((context: GithubCredentials, owner?: string, repo?: string) => {
//   const splitContextId = context.id.split('/');
//   const storageClient = new GithubTokenStorage(context.secret, owner ?? splitContextId[0], repo ?? splitContextId[1], context.baseUrl ?? '');

//   if (context.filePath) storageClient.changePath(context.filePath);
//   if (context.branch) storageClient.selectBranch(context.branch);
//   if (isProUser) storageClient.enableMultiFile();

//   return storageClient;
// }, [isProUser]);

interface ProviderState {
  editProhibited?: boolean;
  branches?: string[];
}

class ProviderWithState<State> {
  private eventListeners: Record<string, EventListener[]> = {};
  private state: State | null = null;

  constructor(initialState: State) {
    this.state = initialState;
  }

  on(event: string, listener: EventListener) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(listener);
  }

  private triggerEvent(event: string, data?: any) {
    const listeners = this.eventListeners[event];
    if (listeners) {
      listeners.forEach((listener) => listener(data));
    }
  }

  setState(newState: State) {
    this.state = newState;
    this.triggerEvent('stateChange', newState);
  }
}

export class GitHubProvider extends ProviderWithState<ProviderState> {
  private storage;
  private context;

  constructor(context, owner?: string, repo?: string, isMultiFileEnabled?: boolean) {
    super({});
    const splitContextId = context.id.split('/');
    this.storage = new GithubTokenStorage(context.secret, owner ?? splitContextId[0], repo ?? splitContextId[1], context.baseUrl ?? '');
    this.context = context;
    if (context.filePath) this.storage.changePath(context.filePath);
    if (context.branch) this.storage.selectBranch(context.branch);
    if (isMultiFileEnabled) this.storage.enableMultiFile();
  }

  private setEditProhibited(value) {
    this.setState({
      ...this.setState,
      editProhibited: value,
    });
  }
  private setBranches(branches) {
    this.setState({
      ...this.setState,
      branches,
    });
  }

  private askUserIfPull(confirm) {
    // this.on('')
    const confirmResult = await confirm({
      text: 'Pull from GitHub?',
      description: 'Your repo already contains tokens, do you want to pull these now?',
    });
    return confirmResult;
  }




  public checkAndSetAccess(receivedFeatureFlags?: LDProps['flags']) {
    if (receivedFeatureFlags?.multiFileSync) this.storage.enableMultiFile();
    const hasWriteAccess = await this.storage.canWrite();
    this.setEditProhibited(!hasWriteAccess);
  }


  public async syncTokensWithGitHub(confirm) {
    async (): Promise<RemoteResponseData> => {
      try {
        const hasBranches = await this.storage.fetchBranches();
        this.setBranches(hasBranches);
        if (!hasBranches || !hasBranches.length) {
          return {
            status: 'failure',
            errorMessage: ErrorMessages.EMPTY_BRANCH_ERROR,
          };
        }
  
        await this.checkAndSetAccess();
  
        const content = await this.storage.retrieve();
        if (content?.status === 'failure') {
          return {
            status: 'failure',
            errorMessage: content.errorMessage,
          };
        }
        if (content) {
          if (
            !isEqual(content.tokens, tokens)
            || !isEqual(content.themes, themes)
            || !isEqual(content.metadata?.tokenSetOrder ?? Object.keys(tokens), Object.keys(tokens))
          ) {
            const userDecision = await this.askUserIfPull(confirm);
            // if (userDecision) {
            //   const commitSha = await this.storage.getCommitSha();
            //   const sortedValues = applyTokenSetOrder(content.tokens, content.metadata?.tokenSetOrder);
            //   if (dispatch) {
            //     dispatch.tokenState.setTokenData({
            //       values: sortedValues,
            //       themes: content.themes,
            //       activeTheme,
            //       usedTokenSet,
            //       hasChangedRemote: true,
            //     });
            //     dispatch.tokenState.setRemoteData({
            //       tokens: sortedValues,
            //       themes: content.themes,
            //       metadata: content.metadata,
            //     });
            //     const stringifiedRemoteTokens = JSON.stringify(compact([content.tokens, content.themes, TokenFormat.format]), null, 2);
            //     dispatch.tokenState.setLastSyncedState(stringifiedRemoteTokens);
            //     dispatch.tokenState.setCollapsedTokenSets([]);
            //     dispatch.uiState.setApiData({ ...context, ...(commitSha ? { commitSha } : {}) });
            //   }
            //   if (notifyToUI) {
            //     notifyToUI('Pulled tokens from GitHub');
            //   }
            // }
          }
          return content;
        }
        return await this.pushTokensToGitHub();
      } catch (e) {
        // if (notifyToUI) {
        //   notifyToUI(ErrorMessages.GITHUB_CREDENTIAL_ERROR, { error: true });
        // }
        console.log('Error', e);
        return {
          status: 'failure',
          errorMessage: ErrorMessages.GITHUB_CREDENTIAL_ERROR,
        };
  }
}

export function useGitHub({
  isProUser, dispatch, confirm, pushDialog, closePushDialog, tokens, themes, activeTheme, usedTokenSet, storeTokenIdInJsonEditor, localApiState, notifyToUI, asyncMessageCredentialsCallback,
}: { isProUser: boolean; dispatch?: any, confirm?: any, pushDialog?: any, closePushDialog?: any, tokens: any, themes: any, activeTheme: any, usedTokenSet: any, storeTokenIdInJsonEditor: any, localApiState: any, notifyToUI?: any, asyncMessageCredentialsCallback?: any }) {
  const storageClientFactory = useCallback((context: GithubCredentials, owner?: string, repo?: string) => {
    const splitContextId = context.id.split('/');
    const storageClient = new GithubTokenStorage(context.secret, owner ?? splitContextId[0], repo ?? splitContextId[1], context.baseUrl ?? '');

    if (context.filePath) storageClient.changePath(context.filePath);
    if (context.branch) storageClient.selectBranch(context.branch);
    if (isProUser) storageClient.enableMultiFile();

    return storageClient;
  }, [isProUser]);

  const askUserIfPull = useCallback(async () => {
    const confirmResult = await confirm({
      text: 'Pull from GitHub?',
      description: 'Your repo already contains tokens, do you want to pull these now?',
    });
    return confirmResult;
  }, [confirm]);

  const pushTokensToGitHub = useCallback(async (context: GithubCredentials, overrides?: PushOverrides): Promise<RemoteResponseData> => {
    const storage = storageClientFactory(context);
    if (dispatch) {
      dispatch.uiState.setLocalApiState({ ...context });
    }
    const pushSettings = await pushDialog({ state: 'initial', overrides });
    if (pushSettings) {
      const { commitMessage, customBranch } = pushSettings;
      try {
        if (customBranch) storage.selectBranch(customBranch);
        const metadata = {
          tokenSetOrder: Object.keys(tokens),
        };
        await storage.save({
          themes,
          tokens,
          metadata,
        }, {
          commitMessage,
          storeTokenIdInJsonEditor,
        });
        const commitSha = await storage.getCommitSha();
        if (dispatch) {
          dispatch.uiState.setLocalApiState({ ...localApiState, branch: customBranch } as GithubCredentials);
          dispatch.uiState.setApiData({ ...context, branch: customBranch, ...(commitSha ? { commitSha } : {}) });
          dispatch.tokenState.setTokenData({
            values: tokens,
            themes,
            usedTokenSet,
            activeTheme,
            hasChangedRemote: true,
          });
          dispatch.tokenState.setRemoteData({
            tokens,
            themes,
            metadata,
          });
          const stringifiedRemoteTokens = JSON.stringify(compact([tokens, themes, TokenFormat.format]), null, 2);
          dispatch.tokenState.setLastSyncedState(stringifiedRemoteTokens);
        }
        pushDialog({ state: 'success' });
        return {
          status: 'success',
          tokens,
          themes,
        };
      } catch (e) {
        closePushDialog();
        console.log('Error pushing to GitHub', e);
        if (e instanceof Error && e.message === ErrorMessages.GIT_MULTIFILE_PERMISSION_ERROR) {
          return {
            status: 'failure',
            errorMessage: ErrorMessages.GIT_MULTIFILE_PERMISSION_ERROR,
          };
        }
        return {
          status: 'failure',
          errorMessage: ErrorMessages.GITHUB_CREDENTIAL_ERROR,
        };
      }
    }

    return {
      status: 'success',
      tokens,
      themes,
      metadata: {},
    };
  }, [
    storageClientFactory,
    dispatch.uiState,
    dispatch.tokenState,
    pushDialog,
    closePushDialog,
    tokens,
    themes,
    localApiState,
    usedTokenSet,
    activeTheme,
  ]);

  const checkAndSetAccess = useCallback(async ({
    context, owner, repo, receivedFeatureFlags,
  }: { context: GithubCredentials; owner: string; repo: string, receivedFeatureFlags?: LDProps['flags'] }) => {
    const storage = storageClientFactory(context, owner, repo);
    if (receivedFeatureFlags?.multiFileSync) storage.enableMultiFile();
    const hasWriteAccess = await storage.canWrite();
    if (dispatch) {
      dispatch.tokenState.setEditProhibited(!hasWriteAccess);
    }
  }, [dispatch, storageClientFactory]);

  const pullTokensFromGitHub = useCallback(async (context: GithubCredentials, receivedFeatureFlags?: LDProps['flags']): Promise<RemoteResponseData | null> => {
    const storage = storageClientFactory(context);
    if (receivedFeatureFlags?.multiFileSync) storage.enableMultiFile();

    const [owner, repo] = context.id.split('/');

    await checkAndSetAccess({
      context, owner, repo, receivedFeatureFlags,
    });

    try {
      const content = await storage.retrieve();
      if (content?.status === 'failure') {
        return {
          status: 'failure',
          errorMessage: content.errorMessage,
        };
      }
      if (content) {
        // If we didn't get a tokenSetOrder from metadata, use the order of the token sets as they appeared
        const sortedTokens = applyTokenSetOrder(content.tokens, content.metadata?.tokenSetOrder ?? Object.keys(content.tokens));
        const commitSha = await storage.getCommitSha();
        return {
          ...content,
          tokens: sortedTokens,
          commitSha,
        };
      }
    } catch (e) {
      return {
        status: 'failure',
        errorMessage: ErrorMessages.GITHUB_CREDENTIAL_ERROR,
      };
    }
    return null;
  }, [
    checkAndSetAccess,
    storageClientFactory,
  ]);

  // Function to initially check auth and sync tokens with GitHub
  const syncTokensWithGitHub = useCallback(async (context: GithubCredentials): Promise<RemoteResponseData> => {
    try {
      const storage = storageClientFactory(context);
      const hasBranches = await storage.fetchBranches();
      if (dispatch) {
        dispatch.branchState.setBranches(hasBranches);
      }
      if (!hasBranches || !hasBranches.length) {
        return {
          status: 'failure',
          errorMessage: ErrorMessages.EMPTY_BRANCH_ERROR,
        };
      }

      const [owner, repo] = context.id.split('/');
      await checkAndSetAccess({ context, owner, repo });

      const content = await storage.retrieve();
      if (content?.status === 'failure') {
        return {
          status: 'failure',
          errorMessage: content.errorMessage,
        };
      }
      if (content) {
        if (
          !isEqual(content.tokens, tokens)
          || !isEqual(content.themes, themes)
          || !isEqual(content.metadata?.tokenSetOrder ?? Object.keys(tokens), Object.keys(tokens))
        ) {
          const userDecision = await askUserIfPull();
          if (userDecision) {
            const commitSha = await storage.getCommitSha();
            const sortedValues = applyTokenSetOrder(content.tokens, content.metadata?.tokenSetOrder);
            if (dispatch) {
              dispatch.tokenState.setTokenData({
                values: sortedValues,
                themes: content.themes,
                activeTheme,
                usedTokenSet,
                hasChangedRemote: true,
              });
              dispatch.tokenState.setRemoteData({
                tokens: sortedValues,
                themes: content.themes,
                metadata: content.metadata,
              });
              const stringifiedRemoteTokens = JSON.stringify(compact([content.tokens, content.themes, TokenFormat.format]), null, 2);
              dispatch.tokenState.setLastSyncedState(stringifiedRemoteTokens);
              dispatch.tokenState.setCollapsedTokenSets([]);
              dispatch.uiState.setApiData({ ...context, ...(commitSha ? { commitSha } : {}) });
            }
            if (notifyToUI) {
              notifyToUI('Pulled tokens from GitHub');
            }
          }
        }
        return content;
      }
      return await pushTokensToGitHub(context);
    } catch (e) {
      if (notifyToUI) {
        notifyToUI(ErrorMessages.GITHUB_CREDENTIAL_ERROR, { error: true });
      }
      console.log('Error', e);
      return {
        status: 'failure',
        errorMessage: ErrorMessages.GITHUB_CREDENTIAL_ERROR,
      };
    }
  }, [
    askUserIfPull,
    dispatch,
    pushTokensToGitHub,
    storageClientFactory,
    usedTokenSet,
    activeTheme,
    themes,
    tokens,
    checkAndSetAccess,
  ]);

  const addNewGitHubCredentials = useCallback(async (context: GithubFormValues): Promise<RemoteResponseData> => {
    const data = await syncTokensWithGitHub(context);
    if (data.status === 'success') {
      if (asyncMessageCredentialsCallback) {
        asyncMessageCredentialsCallback(context);
      }
      if (!data.tokens && notifyToUI) {
        notifyToUI('No tokens stored on remote');
      }
    } else {
      return {
        status: 'failure',
        errorMessage: data.errorMessage,
      };
    }
    return {
      status: 'success',
      tokens: data.tokens ?? tokens,
      themes: data.themes ?? themes,
      metadata: {},
    };
  }, [
    syncTokensWithGitHub,
    tokens,
    themes,
  ]);

  const fetchGithubBranches = useCallback(async (context: GithubCredentials) => {
    const storage = storageClientFactory(context);
    const fetchedBranches = await storage.fetchBranches();
    return fetchedBranches;
  }, [storageClientFactory]);

  const createGithubBranch = useCallback(async (context: GithubCredentials, newBranch: string, source?: string) => {
    const storage = storageClientFactory(context);
    const createdBranch = await storage.createBranch(newBranch, source);
    return createdBranch;
  }, [storageClientFactory]);

  const checkRemoteChangeForGitHub = useCallback(async (context: GithubCredentials): Promise<boolean> => {
    const storage = storageClientFactory(context);
    try {
      const remoteSha = await storage.getCommitSha();
      if (remoteSha && context.commitSha && context.commitSha !== remoteSha) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [storageClientFactory]);

  return useMemo(() => ({
    addNewGitHubCredentials,
    syncTokensWithGitHub,
    pullTokensFromGitHub,
    pushTokensToGitHub,
    fetchGithubBranches,
    createGithubBranch,
    checkRemoteChangeForGitHub,
  }), [
    addNewGitHubCredentials,
    syncTokensWithGitHub,
    pullTokensFromGitHub,
    pushTokensToGitHub,
    fetchGithubBranches,
    createGithubBranch,
    checkRemoteChangeForGitHub,
  ]);
}

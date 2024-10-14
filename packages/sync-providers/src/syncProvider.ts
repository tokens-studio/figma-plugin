import { JSONBinTokenStorage } from "./storage";
import { ADOTokenStorage } from "./storage/ADOTokenStorage";
import { BitbucketTokenStorage } from "./storage/BitbucketTokenStorage";
import { GithubTokenStorage } from "./storage/GithubTokenStorage";
import { GitlabTokenStorage } from "./storage/GitlabTokenStorage";
import { SupernovaTokenStorage } from "./storage/SupernovaTokenStorage";
import { TokensStudioTokenStorage } from "./storage/TokensStudioTokenStorage";
import { StorageProviderType, StorageTypeCredentials } from "./types";



// a.baseUrl
// a.branch
// a.commitSha
// a.filePath
// a.id
// a.internalId
// a.name
// a.provider
// a.secret

export class SyncProvider {
  provider: StorageProviderType;
  storage: GithubTokenStorage | GitlabTokenStorage | BitbucketTokenStorage | ADOTokenStorage | SupernovaTokenStorage | TokensStudioTokenStorage | JSONBinTokenStorage | null = null;
  secret: string;
  branch: string;
  context: StorageTypeCredentials;
  commitMessage: string;

  constructor(provider, secret, branch, commitMessage, context) {
    this.provider = provider;
    this.secret = secret;
    this.branch = branch;
    this.context = context;
    this.commitMessage = commitMessage;

    switch(provider) {
      case StorageProviderType.GITHUB: {
        const [owner, repo] = context.id.split('/');
        this.storage = new GithubTokenStorage(secret, owner, repo, context.baseUrl);
      }
    }
  }

  restoreStoredProvider() {
    
  }

  async push(files) {
    const { provider } = this;
    switch(provider) {
      case StorageProviderType.GITHUB: {
        const storage = this.storage as GithubTokenStorage;
        const branches = await storage.fetchBranches();
        storage.writeChangeset(files, this.commitMessage, this.branch, branches?.includes(this.branch));
      }
    }

    let pushResult;
      switch (provider) {
        case StorageProviderType.GITHUB: {
          const storage = this.storage as GithubTokenStorage;
        const branches = await storage.fetchBranches();
        storage.writeChangeset(files, this.commitMessage, this.branch, branches?.includes(this.branch));
          break;
        }
        case StorageProviderType.GITLAB: {
          const storage = this.storage as GitlabTokenStorage;
          const branches = await storage.fetchBranches();
          storage.writeChangeset(files, this.commitMessage, this.branch, branches?.includes(this.branch));
            break;
        }
        case StorageProviderType.BITBUCKET: {
          const storage = this.storage as BitbucketTokenStorage;
          const branches = await storage.fetchBranches();
          storage.writeChangeset(files, this.commitMessage, this.branch, branches?.includes(this.branch));
            break;
        }
        case StorageProviderType.ADO: {
          const storage = this.storage as ADOTokenStorage;
          const branches = await storage.fetchBranches();
          const pushResult = await storage.writeChangeset(files, this.commitMessage, this.branch, branches?.includes(this.branch));
          // pushResult = await pushTokensToADO(context);
          break;
        }
        case StorageProviderType.SUPERNOVA: {
          const storage = this.storage as SupernovaTokenStorage;
          storage.write(files);
          // pushResult = await pushTokensToSupernova(context);
          break;
        }
        // FIXME: Raw file write is unimplemented
        // case StorageProviderType.TOKENS_STUDIO: {
        //   const storage = this.storage as TokensStudioTokenStorage;
        //   storage.write();
        //   break;
        // }
        default:
          throw new Error('Not implemented');
      }
  }

  async pull() {
    const { provider } = this;
    let remoteData;
    switch (provider) {
              case StorageProviderType.JSONBIN: {
                const storage = this.storage as JSONBinTokenStorage;
                remoteData = await storage.retrieve();
                break;
              }
              // case StorageProviderType.GENERIC_VERSIONED_STORAGE: {
              //   remoteData = await pullTokensFromGenericVersionedStorage(context);
              //   break;
              // }
              // case StorageProviderType.GITHUB: {
              //   remoteData = await pullTokensFromGitHub(context, featureFlags);
              //   break;
              // }
              // case StorageProviderType.BITBUCKET: {
              //   remoteData = await pullTokensFromBitbucket(context, featureFlags);
              //   break;
              // }
              // case StorageProviderType.GITLAB: {
              //   remoteData = await pullTokensFromGitLab(context, featureFlags);
              //   break;
              // }
              // case StorageProviderType.ADO: {
              //   remoteData = await pullTokensFromADO(context, featureFlags);
              //   break;
              // }
              // case StorageProviderType.URL: {
              //   remoteData = await pullTokensFromURL(context);
              //   break;
              // }
              // case StorageProviderType.SUPERNOVA: {
              //   remoteData = await pullTokensFromSupernova(context);
              //   break;
              // }
              // case StorageProviderType.TOKENS_STUDIO: {
              //   remoteData = await pullTokensFromTokensStudio(context);
              //   break;
              // }
              default:
                throw new Error('Not implemented');
            }
  }

  async pushTokens({ themes, tokens, metadata }, storeTokenIdInJsonEditor) {
    const { provider } = this;
    switch(provider) {
      case StorageProviderType.GITHUB: {
        const storage = this.storage as GithubTokenStorage;
        await storage.save({
          themes,
          tokens,
          metadata,
        }, {
          commitMessage: this.commitMessage,
          storeTokenIdInJsonEditor,
        });
        break;
      }
      case StorageProviderType.TOKENS_STUDIO: {
        // FIXME:
        (this.storage as TokensStudioTokenStorage).push({
          action: 'CREATE_TOKEN',
          data: null,
          // metadata: null,
        })
        break;
      }
    }
  }

  async pullTokens() {
    let remoteData;
    const { provider } = this;
    switch(provider) {
      case StorageProviderType.GITHUB: {
        const storage = this.storage as GithubTokenStorage;
        remoteData = storage.read();
      }
      default: {
        throw new Error('Not implemented');
      }
    }
  }
}
import * as BitbucketClient from 'bitbucket';

// const ExtendedBitbucketConstructor: any = (...args: ConstructorParameters<typeof Bitbucket>) =>
//   new Bitbucket(...args);

type ExtendedBitbucketClient = Omit<BitbucketClient.APIEndpoints, 'repositories'> & {
  repositories: BitbucketClient.APIEndpoints['repositories'] & {
    createOrUpdateFiles: (params: {
      owner: string;
      repo: string;
      branch: string;
      createBranch?: boolean;
      changes: {
        message: string;
        files: Record<string, string>;
      }[];
    }) => ReturnType<BitbucketClient.APIEndpoints['repositories']['createSrcFileCommit']>;
  };
};

import * as Bitbucket from 'bitbucket';

export type ExtendedBitbucketClient = Omit<Bitbucket.APIEndpoints, 'repositories'> & {
  repositories: Bitbucket.APIEndpoints['repositories'] & {
    createOrUpdateFiles: (params: {
      owner: string;
      repo: string;
      branch: string;
      createBranch?: boolean;
      changes: {
        message: string;
        files: Record<string, string>;
      }[];
    }) => ReturnType<Bitbucket.APIEndpoints['repositories']['createSrcFileCommit']>;
  };
};

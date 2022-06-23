<<<<<<< HEAD
import * as BitbucketClient from 'bitbucket';

// const ExtendedBitbucketConstructor: any = (...args: ConstructorParameters<typeof Bitbucket>) =>
//   new Bitbucket(...args);

type ExtendedBitbucketClient = Omit<BitbucketClient.APIEndpoints, 'repositories'> & {
  repositories: BitbucketClient.APIEndpoints['repositories'] & {
=======
import * as Bitbucket from 'bitbucket';

export type ExtendedBitbucketClient = Omit<Bitbucket.APIEndpoints, 'repositories'> & {
  repositories: Bitbucket.APIEndpoints['repositories'] & {
>>>>>>> 00ab73e (wrestling with extending bitbucket constructor)
    createOrUpdateFiles: (params: {
      owner: string;
      repo: string;
      branch: string;
      createBranch?: boolean;
      changes: {
        message: string;
        files: Record<string, string>;
      }[];
<<<<<<< HEAD
    }) => ReturnType<BitbucketClient.APIEndpoints['repositories']['createSrcFileCommit']>;
=======
    }) => ReturnType<Bitbucket.APIEndpoints['repositories']['createSrcFileCommit']>;
>>>>>>> 00ab73e (wrestling with extending bitbucket constructor)
  };
};

import { Octokit } from '@octokit/rest';
import type { ContextObject } from '@/types/api';

type Options = {
  context: ContextObject
  owner: string
  repo: string
};

export const checkPermissions = async ({ context, owner, repo }: Options) => {
  try {
    const octokit = new Octokit({ auth: context.secret, baseUrl: context.baseUrl });

    const currentUser = await octokit.rest.users.getAuthenticated();

    if (!currentUser.data.login) return null;

    const permissions = await octokit.rest.repos.getCollaboratorPermissionLevel({
      owner,
      repo,
      username: currentUser.data.login,
    });

    return permissions;
  } catch (e) {
    console.log(e);

    return null;
  }
};

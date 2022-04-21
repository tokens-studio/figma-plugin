import { Octokit } from '@octokit/rest';
import { ContextObject } from '@/types/api';
import { decodeBase64 } from '@/utils/string';
import IsJSONString from '@/utils/isJSONString';
import { FeatureFlagOpts } from './FeatureFlagOpts';

type Options = {
  context: ContextObject
  owner: string
  repo: string
  opts?: FeatureFlagOpts
};

function getTreeMode(type: 'dir' | 'file' | string) {
  switch (type) {
    case 'dir':
      return '040000';
    default:
      return '100644';
  }
}

export const readContents = async ({
  context, owner, repo, opts,
}: Options) => {
  const octokit = new Octokit({ auth: context.secret, baseUrl: context.baseUrl });
  let response;

  try {
    response = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: context.filePath,
      ref: context.branch,
    });

    const fileContents: Array<{ name: string; data: string }> = [];
    if (Array.isArray(response.data) && opts?.multiFile) {
      const folderResponse = await octokit.rest.git.createTree({
        owner,
        repo,
        tree: response.data.map((item) => ({ path: item.path, sha: item.sha, mode: getTreeMode(item.type) })),
      });
      if (folderResponse.data.tree[0].sha) {
        const treeResponse = await octokit.rest.git.getTree({
          owner,
          repo,
          tree_sha: folderResponse.data.tree[0].sha,
          recursive: 'true',
        });
        if (treeResponse.data.tree.length > 0) {
          await Promise.all(
            treeResponse.data.tree
              .filter((i) => i.path?.endsWith('.json'))
              .map((treeItem) => {
                if (treeItem.path) {
                  return octokit.rest.repos
                    .getContent({
                      owner,
                      repo,
                      path: `${context.filePath}/${treeItem.path}`,
                      ref: context.branch,
                    })
                    .then((res) => {
                      if (!Array.isArray(res.data) && 'content' in res.data && treeItem.path) {
                        fileContents.push({ name: treeItem.path.replace('.json', ''), data: decodeBase64(res.data.content) });
                      }
                    });
                }
                return null;
              }),
          );
        }
      }

      if (fileContents.length > 0) {
        // If we receive multiple files, parse each
        // sort by name (as we can't guarantee order)
        const allContents = fileContents
          .sort((a, b) => a.name.localeCompare(b.name))
          .reduce<Record<string, any>>((acc, curr) => {
          if (IsJSONString(curr.data)) {
            const parsed = JSON.parse(curr.data);
            acc[curr.name] = parsed;
          }
          return acc;
        }, {});
        return allContents ? { values: allContents } : null;
      }
    } else if ('content' in response.data) {
      const data = decodeBase64(response.data.content);
      // If content of file is parseable JSON, parse it
      if (IsJSONString(data)) {
        const parsed = JSON.parse(data);
        return {
          values: parsed,
        };
      }
    }
    // If not, return null as we can't process that file. We should let the user know, though.
    return null;
  } catch (e) {
    // Raise error (usually this is an auth error)
    console.log('Error', e);
    return null;
  }
};

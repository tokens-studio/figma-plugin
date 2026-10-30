import { studioApiErrorFromResponse } from './StudioApiError';

export interface RestBranch {
  id: string;
  name: string;
  is_default: boolean;
  change_set_id: string;
}

export function parseBranchesFromResponse(branchesData: any): RestBranch[] {
  let branches: RestBranch[] = [];
  if (branchesData.data && Array.isArray(branchesData.data)) {
    branches = branchesData.data.map((item: any) => ({
      id: item.id || '',
      name: item.attributes?.name || item.id || '',
      is_default: item.attributes?.is_default || item.attributes?.is_main || false,
      change_set_id: item.id,
    }));
  } else if (Array.isArray(branchesData)) {
    branches = branchesData.map((item: any) => ({
      id: item.id || item.name || '',
      name: item.name || item.id || '',
      is_default: item.is_default || item.is_main || false,
      change_set_id: item.id,
    }));
  }
  return branches;
}

// Shared helper — one place that owns the /branches request
// shape, error text, and parsing so callers don't drift.
export async function fetchBranches(
  authToken: string,
  apiBaseUrl: string,
  projectId: string,
): Promise<RestBranch[]> {
  const headers = {
    Authorization: `Bearer ${authToken}`,
    'Content-Type': 'application/json',
  };
  const url = `${apiBaseUrl}/api/v1/projects/${projectId}/branches`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw await studioApiErrorFromResponse(res, `Failed to fetch branches at ${url}`);
  }
  return parseBranchesFromResponse(await res.json());
}

// Resolve the change_set_id for a specific branch. Used by the push path
// when the in-memory credential lost its changeSetId across a plugin reload
// — the pull hydrates it into Redux, but Redux state doesn't survive a
// reload and OAuth credentials aren't persisted through `updateCredentials`.
// Rather than reworking OAuth persistence, we re-resolve on demand.
//
// If a `branchName` is provided and doesn't match an existing branch, this
// returns null so the caller can surface a re-select prompt — silently
// falling back to the default/first branch could send a push to the wrong
// branch. The default/first fallback is only applied when no branchName is
// specified.
export async function fetchChangeSetIdForBranch(
  authToken: string,
  apiBaseUrl: string,
  projectId: string,
  branchName?: string,
): Promise<string | null> {
  try {
    const branches = await fetchBranches(authToken, apiBaseUrl, projectId);
    if (branchName) {
      const target = branches.find((b) => b.name === branchName);
      return target?.change_set_id ?? null;
    }
    const target = branches.find((b) => b.is_default) || branches[0];
    return target?.change_set_id ?? null;
  } catch (error) {
    console.error('Error resolving change_set_id for branch:', error);
    return null;
  }
}

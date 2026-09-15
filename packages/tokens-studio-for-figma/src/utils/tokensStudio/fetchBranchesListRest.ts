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

export async function fetchBranchesListRest(
  authToken: string,
  apiBaseUrl: string,
  projectId: string,
): Promise<string[] | null> {
  const headers = {
    Authorization: `Bearer ${authToken}`,
    'Content-Type': 'application/json',
  };

  try {
    const branchesRes = await fetch(`${apiBaseUrl}/api/v1/projects/${projectId}/branches`, { headers });
    if (!branchesRes.ok) throw new Error(`Failed to fetch branches: ${branchesRes.statusText}`);
    const branchesData = await branchesRes.json();

    const branches = parseBranchesFromResponse(branchesData);

    return branches.map((b) => b.name);
  } catch (error) {
    console.error('Error fetching branches from REST API:', error);
    return null;
  }
}

// Resolve the change_set_id for a specific branch (falling back to the
// default branch, then the first available). Used by the push path when the
// in-memory credential lost its changeSetId across a plugin reload — the
// pull hydrates it into Redux, but Redux state doesn't survive a reload and
// OAuth credentials aren't persisted through `updateCredentials`. Rather
// than reworking OAuth persistence, we re-resolve on demand.
export async function fetchChangeSetIdForBranch(
  authToken: string,
  apiBaseUrl: string,
  projectId: string,
  branchName?: string,
): Promise<string | null> {
  const headers = {
    Authorization: `Bearer ${authToken}`,
    'Content-Type': 'application/json',
  };
  try {
    const res = await fetch(`${apiBaseUrl}/api/v1/projects/${projectId}/branches`, { headers });
    if (!res.ok) throw new Error(`Failed to fetch branches: ${res.statusText}`);
    const branches = parseBranchesFromResponse(await res.json());
    const target = (branchName && branches.find((b) => b.name === branchName))
      || branches.find((b) => b.is_default)
      || branches[0];
    return target?.change_set_id ?? null;
  } catch (error) {
    console.error('Error resolving change_set_id for branch:', error);
    return null;
  }
}

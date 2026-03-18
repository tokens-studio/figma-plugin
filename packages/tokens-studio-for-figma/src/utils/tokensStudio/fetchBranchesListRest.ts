export interface RestBranch {
  id: string;
  name: string;
  is_default: boolean;
  change_set_id: string;
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

    return branches.map((b) => b.name);
  } catch (error) {
    console.error('Error fetching branches from REST API:', error);
    return null;
  }
}
